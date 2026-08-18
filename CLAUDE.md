# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**SparkDynamic's permanent hard fork of [usewaypoint/email-builder-js](https://github.com/usewaypoint/email-builder-js)** (MIT), forked at upstream head `ce3e610` (2026-02-09).

It is the editor we are building the Cloudwawi newsletter module on, replacing BeeFree. Full context, decision record, and work queue: **[Cloudwawi#259](https://github.com/SparkDynamic-GmbH/Cloudwawi/issues/259)** — read the two decision comments before making architectural changes.

Short version of the decision:

- Upstream is dormant (no commits in 2025; a short burst Jan–Feb 2026; open issue "Is this project still maintained?"). **Vendor it, don't chase it** — this is not a tracking fork, don't add upstream as a remote or plan merges.
- It was chosen because it is the _only_ MIT editor in the **canvas + block tree + property inspector** family — the UI family BeeFree users are trained on. Tiptap/typing-flow editors (Maily.to, react-email v6) were excluded on UX family, not licensing.
- The things upstream declined are exactly the things we need: **React 19** (three community PRs closed unmerged) and **merge tags** (refused by explicit maintainer policy). Both are ours to build.

### Standing decisions — do not re-litigate

| Decision                                                                                   | Consequence                                                                                                  |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **Drop MUI entirely**; rebuild the editor shell + sidebar panels on **Tailwind 4 + Radix** | **Done.** Matches `Cloudwawi.Web`. Do _not_ add MUI components to new code.                                  |
| **React 19**                                                                               | **Done**, together with de-MUI — MUI v5 was the main React-19 friction point, so they were one job, not two. |
| **Table-based markup in the block renderers**                                              | **Done.** The real Outlook fix. Write new blocks table-first.                                                |
| Keep `react-colorful`                                                                      | 2.8 kB, no deps; Radix has no colour picker.                                                                 |
| BeeFree stays available for tenants who want it                                            | This is about what we build on, not removing an existing flow.                                               |

**Cherry-pick source, not a base:** [onchainsuite/email-builder-js](https://github.com/onchainsuite/email-builder-js) independently solved three of our gaps — `VariablesContext` (merge-tag picker), undo/redo in `EditorContext`, and `makeResponsiveHtml.ts` (ESP-sanitizer-proof export). All MIT; **preserve attribution** when lifting. Caveat: all three are post-processing in the sample app, _not_ fixes in the renderers.

> **Path drift:** the issue and plan doc refer to `packages/editor-sample`. Upstream commit `ecf226b` moved it — in this tree it is **`examples/vite-emailbuilder`**.

## Commands

Built and run locally; there is no CI (workflows were removed deliberately — this is an internal fork).

```bash
npm ci                                  # root, installs all workspaces
npm run build --workspaces              # tsup + tailwind; the app resolves dist, so run this first
npm test                                # jest (ts-jest + jsdom)
npx tsc --noEmit                        # typecheck
npx eslint . && npx prettier . --check  # what CI used to enforce; still the bar

cd examples/vite-emailbuilder && npx vite   # editor at http://localhost:5173/email-builder-js/
```

In VS Code, `.vscode/tasks.json` wraps these: **dev: editor** (the default build task, `Ctrl+Shift+B`) builds the packages then starts Vite, and **gate** runs the pre-commit gate as sequential steps. `.vscode/launch.json` adds _Editor in Edge_ / _Editor in Chrome_, which start the dev server and open it with breakpoints attached.

## Architecture

npm-workspaces monorepo, TypeScript + React + zod.

```
packages/
  email-builder/           the one published package, @sparkdynamic/email-builder
    src/core/              block-dictionary framework + the registry (was document-core)
    src/blocks/<Name>/     one dir per block — renderer, spec, snapshots; containers also
                           carry their narrowed schema and their *Reader
    src/Reader/            createReader + the built-in reader
    src/editor/            the editor library — provider, canvas, inspector, ui primitives
      definitions.tsx      the built-in block set, BUILT_IN_BLOCK_DEFINITIONS
      blocks/<Name>/       canvas variants of the blocks that need one
      helpers/             wrappers, TuneMenu, EditorChildrenIds, InlineEditable, richText/
      inspector/           InspectorDrawer, StylesPanel, ConfigurationPanel + input-panels
      ui/                  Radix + Tailwind primitives
      i18n/                en/de catalogs, I18nProvider, useTranslate
      theme.css            design tokens, exported raw as ./theme.css
      styles.css           compiled to dist/styles.css, exported as ./styles.css
    src/exports/           one file per subpath export: extensions, blocks, reader, editor
examples/
  vite-emailbuilder/       a host app: toolbar, view tabs, hash loading, import/export/share
```

Upstream shipped twelve packages — `document-core`, ten `block-*`, and `email-builder` — for its own reuse story. We have one consumer, so they are **one package** now; see [#1](https://github.com/SparkDynamic-GmbH/email-builder-js/issues/1). Subpath exports are how a consumer takes only what it needs:

| Subpath        | Contents                                                              |
| -------------- | --------------------------------------------------------------------- |
| `./extensions` | declare a block, build a registry                                     |
| `./blocks`     | the built-in renderers, schemas, props types, defaults                |
| `./reader`     | `Reader`, `createReader`, `renderToStaticMarkup`                      |
| `./editor`     | provider, canvas, inspector, ui primitives, built-in definitions      |
| `./styles.css` | the editor's compiled stylesheet; `./theme.css` is the raw token file |

### The line between the package and the host app

The package owns the editor; `examples/vite-emailbuilder` is a **host app**, the same shape `Cloudwawi.Web` will be, and it consumes the built package rather than its source. That split is the point — if something the app does can't be done through the public entry points, the entry points are wrong.

The app keeps: the toolbar, the editor/preview/HTML/JSON tab switcher, `registry.ts` (its own `buildBlockRegistry` call plus the strict types it derives for its sample documents), hash-based loading in `getConfiguration/`, import/download/share.

**Styling.** The package ships `dist/styles.css` — its tokens and only the utilities its own components use, built by the Tailwind CLI over `src/editor/` — with **no preflight**, so it doesn't fight a host's reset. Its first line declares `@layer theme, base, components, utilities` on purpose: cascade-layer order is fixed by first appearance, and without it a host's own preflight is seen after our utilities and beats them, which silently strips the padding and borders off every panel. Import the package stylesheet before the host's.

### The central idea: a block dictionary

`packages/email-builder/src/core` is the only real abstraction. A **DocumentBlocksDictionary** maps a block type name → `{ schema: ZodObject, Component: (props) => JSX }` (`core/utils.ts:3`). Builders consume it:

- `buildBlockConfigurationDictionary` — identity fn, purely for type inference
- `buildBlockConfigurationSchema` — turns the dictionary into a zod `discriminatedUnion('type')`, so arbitrary JSON validates into a typed `{type, data}` (`buildBlockConfigurationSchema.ts:12`)
- `buildBlockComponent` — returns `({type, data}) => <blocks[type].Component {...data}/>` (`buildBlockComponent.tsx:9`)

A **document** is flat: `Record<blockId, {type, data}>`. Nesting is by ID reference — containers hold `childrenIds`, rendering starts at `rootBlockId` (`"root"` by convention). The flat shape is what makes duplicate/move/delete tractable, at the cost of manual parent lookup.

### One block set, four consumers

A block is declared **once**, as a `BlockDefinition` — schema, `Reader`, optional `Editor`, optional `SidebarPanel`, optional add-block `menu` entry, optional `chrome: false` (`core/registry.ts`). `buildBlockRegistry` derives everything from a dictionary of them (`buildBlockRegistry.tsx`):

| Derived                          | Used by                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `readerDictionary`               | email output — raw `Avatar`, `Button`, `*Reader` for containers                          |
| `editorDictionary`               | the canvas — `Editor` variant if given, wrapped in `EditorBlockWrapper` unless opted out |
| `blockSchema` / `documentSchema` | validation, shared by reader and canvas so they cannot drift                             |
| `SidebarPanel`                   | `ConfigurationPanel` — dispatch, not a switch                                            |
| `menu`                           | `AddBlockMenu` — key order in the definitions dictionary is menu order                   |

The editor's block set lives in `examples/…/documents/blocks/definitions.tsx`; `documents/editor/core.tsx` builds the registry from it and also builds the preview/HTML-export reader with `createReader(registry.readerDictionary)`, so a registered block appears on the canvas, in the preview and in the export alike.

`packages/email-builder` still ships a built-in reader dictionary (`Reader/core.tsx`) for consumers that only render email and register nothing — it is `createReader(READER_DICTIONARY)`.

Recursion happens via context: `ReaderBlock({id})` reads the document _and its block component_ from `ReaderContext`, so containers recurse into whatever block set their `Reader` was created with; `EditorBlock({id})` reads the document from the zustand store and publishes its own id via `EditorBlockContext` so wrappers know who they are.

Container blocks (`Container`, `ColumnsContainer`, `EmailLayout`) carry a `*Reader` variant next to the plain renderer, because they must call back into `ReaderBlock`/`EditorBlock` to recurse; the plain renderer only takes already-rendered children.

### Blocks

Each block under `src/blocks/` is self-contained and exports `XPropsSchema` (zod), `XProps`, `XPropsDefaults`, `X`. **They have no UI-framework dependency and no dependency on `src/core`** — just `react` + `zod` (plus `insane` in Text). This is why dropping MUI was cheaper than it looked: it touched the editor shell, not the renderers.

The shared `style` shape (color / fontSize / fontFamily / fontWeight / textAlign / padding) and the `getFontFamily` switch are **copy-pasted into every block**. That was deliberate when each block was its own package; now that they are one, deduping it is defensible — but it churns every renderer snapshot, so it is its own change, not a drive-by.

Output is old-school email HTML: `<table role="presentation" cellSpacing="0">`, inline styles, MSO conditional comments injected via `dangerouslySetInnerHTML` (`blocks/Button/index.tsx`). `blocks/Text` holds inline HTML and sanitizes it through `insane` in `EmailRichText.tsx` — **keep that sanitization when touching text rendering.**

Every renderer wraps its content in that table and puts the **padding on the `td`** — Word ignores padding on a `div`. Background colour is emitted twice, as CSS and as a `bgcolor` attribute, and alignment likewise as `text-align` and an `align` attribute; Word honours the attribute where it drops the property. Two blocks go further, and the reasons are load-bearing: `Divider` draws its rule as a cell's `border-top` rather than an `<hr>` (Word renders its own and ignores the width and colour set on it), and `Spacer` holds its height with a `&nbsp;` at a matching `line-height` and a 1px font, because an empty cell collapses. **Write new blocks this way from the start** rather than adding to a pile that has to be migrated later.

The exception is `EmailLayoutEditor` — canvas chrome, never email output, so it stays a `div` and keeps its click-to-deselect handler.

### The editor (`packages/email-builder/src/editor`)

- **State**: one zustand store per `EmailBuilderProvider`, in `EditorContext.tsx` — document, `selectedBlockId`, main tab, screen size, drawer flags. `useX()` hooks read it from context; mutations go through `useEditorActions()`, whose object is stable for the provider's lifetime. An `onChange` prop reports document changes. No reducer.
- **History**: `past`/`future` stacks in the same store, pushed by `setDocument` and `resetDocument` — every mutation already goes through those two, so nothing else has to know. A snapshot is `{document, selectedBlockId}`, so undo puts the inspector back too. Writes to the same block within 500 ms coalesce into one step (a slider drag is one undo, not forty); `resetDocument({clearHistory: true})` is how a host loads a different template without it being undoable. `undoRedoHotkeys` binds Ctrl/Cmd+Z on the window, skipping fields and inline editables, where the browser's own undo owns the caret. `UndoRedoButtons` is host chrome, like `SaveButton`.
- **Erasure boundary**: the provider is generic in the block set and erases it once (`registry as TEditorRegistry`), so every component below is written against the loose `TEditorBlock` (`type: string; data: any`) rather than being generic throughout. A host that wants the strict discriminated union derives it from `registry.blockSchema`, as `examples/…/registry.ts` does. Don't thread generics through the components to "fix" this.
- **Canvas**: `EditorBlock({id})` reads the block from the store and publishes its own id via `EditorBlockContext` so `EditorBlockWrapper` and `TuneMenu` know who they are.
- **Inspector**: `ConfigurationPanel` renders the registry's `SidebarPanel` for the selected block; the panels live in `inspector/ConfigurationPanel/input-panels/`, all built on `BaseSidebarPanel` + reusable inputs under `input-panels/helpers/inputs/`. They are highly repetitive by design — they compose `PaddingInput`, `ColorInput`, `RadioGroupInput` etc., which sit on the primitives in `editor/ui/`.
- **UI primitives** (`editor/ui/`): thin Radix + Tailwind wrappers — `Button`, `IconButton`, `Drawer`, `Tabs`, `ToggleGroup`, `Slider`, `Switch`, `Select`, `TextField`, `Label`, `Dialog`, `Popover`, `Toast`, `Tooltip`. **Style selected states off ARIA (`aria-selected:`, `aria-checked:`), not `data-state`** — wrapping a Radix trigger in a Radix `Tooltip` overwrites `data-state` with the tooltip's own open/closed value.
- **Rich text** (`editor/helpers/richText/`): **every** Text block holds a fragment of inline HTML — there is no plain or markdown mode and no format to choose, so the selection toolbar is always one drag away. `InlineEditable`'s `rich` mode gives it a plain `contentEditable`, and `SelectionToolbar` follows the selection with bold / italic / underline / strikethrough / colour. Three things are load-bearing. The toolbar **never takes focus** (every pointer press inside it is prevented): a focus change would collapse the selection before the command could run, and would blur the editable and commit the block mid-edit. The link panel's _fields_ are the one exception, since a URL has to be typed — they work by saving the range on every read and restoring it before the command runs, with `InlineEditable` treating a blur into the toolbar as no blur at all; its buttons stay focusless like the rest. Formatting is `document.execCommand`, deprecated but the only API that edits a live selection with no document model behind it — which is the point, since the rendered block _is_ the surface; `styleWithCSS` is off for the four marks so browsers emit **semantic tags**, because Word renders `<strong>/<em>/<u>/<del>` reliably but is patchy on `text-decoration` as CSS. And `normalize.ts` reconciles the browsers on commit (Chrome's `<b>` and per-line `<div>`, Firefox's spans, `rgb()` → hex) while `blocks/Text/EmailRichText.tsx` is the actual security boundary and runs again at render. **A span may carry only colour, background and size** — never `font-weight`, `font-style` or `text-decoration`, which are the tags' job: Chrome writes `<span style="font-weight: normal">` around the remainder when you bold part of a run, and stored, that span outranks a `<strong>` wrapped around it later, so the block can never be bolded as a whole again. Don't re-add them to `RICH_TEXT_STYLE_PROPERTIES`. Two consequences: `TextSidebarPanel` has **no content field** — a textarea could only show the marks as raw markup and invite hand-editing the sanitizer would undo — and any `text` written by hand, in a sample document or a host's fixture, must arrive **HTML-escaped**.
- **Mutation**: `TuneMenu.tsx` implements move/duplicate/delete by walking every block to find the parent (`findParentBlockId`); the same three-case container switch repeats in each handler. `cloneDocumentBlock` clones unknown block types as-is, so a host's own leaf block works; a host's own _container_ would need a case.
- **Persistence**: the provider takes `onSave` and owns the state around it — `save()` on the actions, `useSaveStatus()`, `useSaveError()`, `useIsDirty()`, and `SaveButton` rendered off them. `autosave` is **off by default**; when on it debounces by `autosaveDebounceMs` (default 10 s, trailing edge, flushed on unmount). `onChange` is the raw change stream, undebounced, not the save hook. Restoring is `initialDocument`, read once, so a host fetching from a backend must not render the provider until the fetch resolves. The host app's stand-in backend is `localStorage` (`persistence.ts`); it still loads from `window.location.hash` first (`#sample/<name>` or `#code/<base64>`, `getConfiguration/index.tsx`) and `ShareButton` encodes back. `beforeunload` flushing is still the host's.
- **Image library** (`editor/imageLibrary/`): the provider's optional `imageLibrary` prop, published on its own context and read by `ImageSidebarPanel` through `useImageLibrary()`. The contract is callbacks, not URLs — the host owns its base URL, auth and error shapes. `pick` hands the whole interaction to the host and short-circuits the built-in `ImageLibraryDialog`; `upload`/`list` drive that dialog instead. An upload applies as soon as it lands, so the Select button exists only for the grid. `helpers.ts` is a separate module from `index.tsx` on purpose — the dialog and the button import from it, and going through the barrel would be a cycle. A chosen image writes `url` and fills a blank `alt`; it never touches width/height, since an asset's intrinsic size is rarely its render size in an email.
- **Template library** (`editor/templateLibrary/`): the provider's optional `templateLibrary` prop, on the same shape of contract as the image library — callbacks, not storage. `SaveTemplateButton` in a block's `TuneMenu` calls `extractBlockTemplate` to lift the block and every descendant into `{rootBlockId, blocks}` and hands the host that fragment plus a name; the host hands its own array back as `templates`, so the editor keeps no copy and nothing has to be invalidated. `TemplateLibraryPanel` is a Templates tab in the inspector, `TemplatesMenu` sits under the block grid in the add-block menu, and `useInsertBlockTemplate` runs `instantiateBlockTemplate`, which renumbers the whole subtree so a template can sit next to a copy of itself. A template naming a block type the registry doesn't have is listed as unsupported rather than offered (`useIsTemplateSupported`). `helpers.ts` is separate from `index.tsx` for the same cycle reason as the image library's.
- **Block children** (`editor/helpers/blockChildren.ts`): the one place that knows which block types hold children and where. The template walk, the renumber, the insert and `TuneMenu`'s parent lookup go through it instead of repeating the container switch a fourth time. `cloneDocumentBlock` still keeps its own switch — folding it in is a separate change.
- **i18n** (`editor/i18n/`): every string the chrome renders comes from a flat, dotted-key catalog. `en.ts` is the source of truth — `TTranslationKey` is `keyof typeof en`, and `de.ts` is typed `Record<TTranslationKey, string>`, so **adding a key fails the build until German has it too**. The provider takes `language` (ISO 639-1, default `'en'`) and `translations`, a partial override map that also accepts keys of a host's own; lookup is override → language → English → the key itself. `useTranslate()` returns `t(key, params?)`, with `{name}` placeholders. Renderers under `src/blocks/` are untouched — they render the document, which is the user's own words. Add-block labels resolve by convention under `block.<type>` and fall back to the label the definition gave, which is how a host's own block keeps a label without a catalog entry.

## Where to touch what

| Task                       | Files                                                                                                                                                                                                                                                                                  |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New block**              | new `src/blocks/<Name>/`, a `XSidebarPanel` under `src/editor/inspector/…/input-panels/`, then one `BlockDefinition` in `src/editor/definitions.tsx` — canvas, inspector, menu and export all follow. Add it to `src/Reader/core.tsx` too only if the standalone reader should know it |
| Change email HTML output   | the block's `index.tsx`, or `*Reader.tsx` for containers                                                                                                                                                                                                                               |
| Editor behaviour only      | `src/editor/helpers/` (wrappers, `TuneMenu`, `EditorChildrenIds`)                                                                                                                                                                                                                      |
| Text formatting marks      | `src/editor/helpers/richText/` for the toolbar and the browser-output normalizer, `src/blocks/Text/EmailRichText.tsx` for what is allowed to render                                                                                                                                    |
| A block's editable options | `src/editor/inspector/…/input-panels/*SidebarPanel.tsx` + the block's zod schema                                                                                                                                                                                                       |
| The editor's styling       | `src/editor/theme.css` for tokens, `src/editor/styles.css` for the build; rebuild with `npm run build:css -w packages/email-builder`                                                                                                                                                   |
| The template library       | `src/editor/templateLibrary/` — the contract in `types.ts`. The host app's stand-in store is `examples/vite-emailbuilder/src/templateLibrary.ts`                                                                                                                                       |
| The image picker           | `src/editor/imageLibrary/` — the contract in `types.ts`, the dialog and the button beside it. The host app's stand-in store is `examples/vite-emailbuilder/src/imageLibrary.ts`                                                                                                        |
| A user-facing string       | `src/editor/i18n/en.ts` **and** `de.ts` — never a literal in a component. The app's own strings live in `examples/vite-emailbuilder/src/i18n.ts`, keyed `app.*`                                                                                                                        |

## Conventions

- Formatting is enforced by prettier (`.prettierrc`) — run it before committing.
- eslint uses `simple-import-sort`; import order is mechanical, let the fixer do it.
- Tests are colocated snapshot tests — `src/blocks/<Name>/index.spec.tsx` per block, plus the builders under `src/core/builders/`. **Changing renderer markup churns snapshots by design — the diff _is_ the review of the email HTML, so read it rather than blindly running `jest -u`.**
- One package, one `version`. It is unpublished at 0.1.0 — bumping it is publish-affecting, so ask first.

## Releasing

`.github/workflows/publish.yml` publishes on a `v*` tag. It checks the tag against the package version, runs the gate, builds, logs the tarball contents, then `npm publish`.

Authentication is **npm trusted publishing over OIDC** — no `NPM_TOKEN` in this repo, and provenance is attached automatically (the repo is public, which provenance requires). Two things this depends on, both easy to break:

- **The workflow's filename.** The trusted publisher on npmjs.com is configured against this repo _and_ `publish.yml` by name. Renaming the file breaks publishing until npm is updated to match.
- **`registry-url` on `actions/setup-node` is required, _and_ its credential line has to be deleted.** Both halves matter, and getting either wrong costs a release tag:

  - Without `registry-url`, npm has no registry configuration and fails **`ENEEDAUTH`** without ever attempting the OIDC exchange.
  - With it, setup-node writes `_authToken=${NODE_AUTH_TOKEN}` into the `.npmrc` at `$NPM_CONFIG_USERCONFIG` and — when no token is supplied — sets `NODE_AUTH_TOKEN` to the literal placeholder `XXXXX-XXXXX-XXXXX-XXXXX`. npm sends that as a real credential and the registry rejects the identity with a **404**, never reaching OIDC.

  So the workflow keeps `registry-url` and then `sed -i '/_authToken/d' "$NPM_CONFIG_USERCONFIG"`. If npm is older than 11.5.1 the symptom is the same uninformative 404, so check the version the run printed before assuming this is the cause.

### The first publish cannot use this workflow

npm only lets you configure a trusted publisher on a package that **already exists**, so the very first `0.1.0` has to be published another way — locally by a maintainer with 2FA, or once with a granular token. After that, add the trusted publisher in the package settings on npmjs.com and every later release goes through the tag.

Do not tag a release expecting the workflow to bootstrap the package; it will 404.

### Cutting a release

1. Update `CHANGELOG.md` — move `Unreleased` to the new version.
2. Bump `version` in `packages/email-builder/package.json`. **Ask first** — publish-affecting.
3. Commit, then `git tag v<version>` and push the tag.

## Commit policy

There is no CI, so the gate is local and it is not optional. **Nothing is committed on a red build.**

### The gate

```bash
npx prettier . --write && npx eslint . && npx tsc --noEmit && npm test
```

**On a fresh clone, build the package first.** The editor app imports the built package, so `tsc --noEmit` cannot resolve `@sparkdynamic/email-builder/editor` until `dist/` exists — and a tree you have already built hides that, so the failure only shows up in CI or on someone else's machine:

```bash
npm run build --workspace packages/email-builder
```

For changes that touch `packages/*`, add `npm run build --workspaces` — `tsup` + `--dts` catches type errors that `tsc --noEmit` at the root does not, and the editor app imports the built package, not its source.

### Autocommit — the default

**Commit as you go, without asking.** Do not park finished work in the working tree waiting for approval, and do not batch a session's work into one commit at the end. The rule is:

> Green gate + coherent unit → commit immediately, then carry on.

A **coherent unit** is one thing a reader would want to bisect to: one work-queue item, one bug fix, one package folded, one panel ported, one doc brought back in line with the code. If you finish part of a larger job and the tree is green, that part is a unit — commit it and continue rather than growing the diff.

What this means in practice, in order:

1. Run the gate. For `packages/*` changes that includes `npm run build --workspaces`.
2. For anything that changes editor behaviour or styling, **also drive the app** — the type checker does not catch a broken cascade layer or a provider that throws on mount. Report what you verified in the commit message.
3. Commit, with the `Refs` trailer when it implements an issue item.
4. Move to the next unit.

Autocommit covers docs, config and tooling too (`CLAUDE.md`, `README.md`, eslint/prettier/tsconfig, workflows). Keep those in their own commit rather than folding them into a code change, unless the doc change _is_ the code change's other half.

Autocommit is **not** autopush. `git push` still needs asking, every time.

### Never commit without asking

These override autocommit:

- **The gate is red** — failing tests, type errors, lint errors. Report the failure instead. A broken commit is worse than an uncommitted change, because there is no CI to catch it later.
- **The package `version`** in `packages/email-builder/package.json` — publish-affecting.
- **Bulk snapshot updates** (`jest -u`). Renderer changes churn snapshots by design; the diff _is_ the review of the email HTML. Show it, don't absorb it.
- **Mid-refactor states** — a half-moved module set that happens to compile is not a coherent unit. Finish the unit, then commit.
- **Anything you were told to do differently** in the current session. Session instructions outrank this file.

### Branching and history

**Work directly on `main` — do not create branches.** Small team, no CI, no PR review step; a branch here is ceremony with no gate behind it.

History stays **linear**. No merge commits: integrate with rebase or fast-forward only. Configured locally, so the defaults do the right thing:

```bash
git config pull.rebase true   # rebase on pull, never a merge commit
git config merge.ff only      # refuse a merge that isn't a fast-forward
```

If a pull rebases local commits onto new upstream work, that is expected. If `merge.ff only` refuses, histories have diverged — stop and report it rather than forcing a merge.

### Never without an explicit request

- `git push` — always ask, every time.
- `git reset --hard`, force-push, amending or rebasing a commit that is already pushed, `--no-verify`.

Rebasing **unpushed local commits** is fine and is the normal way to keep history linear.

### Message format

```
<area>: <imperative, what changed>

<why, if not obvious from the diff — 1–3 lines>

Refs Cloudwawi#259
Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

`<area>` is the package or app region: `block-button`, `document-core`, `email-builder`, `editor`, `docs`, `repo`.

- Add the `Refs` trailer when the change implements a phase or work-queue item from the issue. Skip it for incidental fixes.
- Attribute lifts from onchainsuite in the body — `Lifted from onchainsuite/email-builder-js (MIT), <file>.`
- Upstream's own style was sentence-case with a PR number (`Fix directory name in README (#185)`). We don't follow it; this is a hard fork with its own history.

### Scope

One logical change per commit. When a task produced several — a port, a bug fix noticed on the way, a snapshot refresh — split them. Prefer several small green commits over one large one; there is no CI bisect to fall back on.
