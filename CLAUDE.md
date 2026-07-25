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

| Decision                                                                                   | Consequence                                                                                                      |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| **Drop MUI entirely**; rebuild the editor shell + sidebar panels on **Tailwind 4 + Radix** | Matches `Cloudwawi.Web`. Do _not_ add MUI components to new code.                                                |
| **React 19**                                                                               | Upgrade happens together with de-MUI — MUI v5 is the main React-19 friction point, so they are one job, not two. |
| **Table-based markup in the `block-*` renderers**                                          | The real Outlook fix. Renderers currently emit `div` + padding.                                                  |
| Keep `react-colorful`                                                                      | 2.8 kB, no deps; Radix has no colour picker.                                                                     |
| BeeFree stays available for tenants who want it                                            | This is about what we build on, not removing an existing flow.                                                   |

**Cherry-pick source, not a base:** [onchainsuite/email-builder-js](https://github.com/onchainsuite/email-builder-js) independently solved three of our gaps — `VariablesContext` (merge-tag picker), undo/redo in `EditorContext`, and `makeResponsiveHtml.ts` (ESP-sanitizer-proof export). All MIT; **preserve attribution** when lifting. Caveat: all three are post-processing in the sample app, _not_ fixes in the renderers.

> **Path drift:** the issue and plan doc refer to `packages/editor-sample`. Upstream commit `ecf226b` moved it — in this tree it is **`examples/vite-emailbuilder-mui`**.

## Commands

Built and run locally; there is no CI (workflows were removed deliberately — this is an internal fork).

```bash
npm ci                                  # root, installs all workspaces
npm run build --workspaces              # tsup build for every package
npm test                                # jest (ts-jest + jsdom)
npx tsc --noEmit                        # typecheck
npx eslint . && npx prettier . --check  # what CI used to enforce; still the bar

cd examples/vite-emailbuilder-mui && npx vite   # editor at http://localhost:5173/email-builder-js/
```

## Architecture

npm-workspaces monorepo, TypeScript + React + zod.

```
packages/
  document-core/     block-dictionary framework (no blocks of its own)
  block-*/  ×10      one leaf block per package — avatar, button, columns-container,
                     container, divider, heading, html, image, spacer, text
  email-builder/     assembles blocks → Reader + renderToStaticMarkup
examples/
  vite-emailbuilder-mui/   the editor SPA (MUI + zustand + vite)
```

### The central idea: a block dictionary

`packages/document-core` is the only real abstraction. A **DocumentBlocksDictionary** maps a block type name → `{ schema: ZodObject, Component: (props) => JSX }` (`document-core/src/utils.ts:3`). Three builders consume it:

- `buildBlockConfigurationDictionary` — identity fn, purely for type inference
- `buildBlockConfigurationSchema` — turns the dictionary into a zod `discriminatedUnion('type')`, so arbitrary JSON validates into a typed `{type, data}` (`buildBlockConfigurationSchema.ts:12`)
- `buildBlockComponent` — returns `({type, data}) => <blocks[type].Component {...data}/>` (`buildBlockComponent.tsx:9`)

A **document** is flat: `Record<blockId, {type, data}>`. Nesting is by ID reference — containers hold `childrenIds`, rendering starts at `rootBlockId` (`"root"` by convention). The flat shape is what makes duplicate/move/delete tractable, at the cost of manual parent lookup.

### Two dictionaries over the same blocks

The key structural fact:

|            | `email-builder/src/Reader/core.tsx:31`                           | `examples/…/documents/editor/core.tsx:27`                                             |
| ---------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Purpose    | pure email output                                                | interactive canvas                                                                    |
| Components | raw `Avatar`, `Button`, …                                        | same, wrapped in `EditorBlockWrapper` (selection outline + `TuneMenu`)                |
| Containers | `ContainerReader`, `ColumnsContainerReader`, `EmailLayoutReader` | `*Editor` variants rendering `EditorChildrenIds` (add-block buttons between children) |

Both are hand-maintained and **must stay in sync**. Recursion happens via context: `ReaderBlock({id})` reads the document from `ReaderContext`; `EditorBlock({id})` reads it from the zustand store and publishes its own id via `EditorBlockContext` so wrappers know who they are.

Container blocks (`Container`, `ColumnsContainer`, `EmailLayout`) live in `email-builder`/the editor rather than their own packages, because they must call back into `ReaderBlock`/`EditorBlock` to recurse.

### Blocks

Each `block-*` package is self-contained and exports `XPropsSchema` (zod), `XProps`, `XPropsDefaults`, `X`. **They have no MUI dependency and no dependency on `document-core`** — just `react` + `zod` peer deps (plus `marked`/`insane` in block-text). This is why dropping MUI is cheaper than it looks: it touches the editor shell, not the renderers.

The shared `style` shape (color / fontSize / fontFamily / fontWeight / textAlign / padding) and the `getFontFamily` switch are **copy-pasted into every block** — deliberate, for package independence. Preserve that independence; don't "fix" it by introducing a shared runtime dependency.

Output is old-school email HTML: `<table role="presentation" cellSpacing="0">`, inline styles, MSO conditional comments injected via `dangerouslySetInnerHTML` (`block-button/src/index.tsx:157`). `block-text` sanitizes markdown through `marked` + `insane` — keep that sanitization when touching text rendering.

### Editor app (`examples/vite-emailbuilder-mui`)

- **State**: one zustand store, `documents/editor/EditorContext.tsx` — document, `selectedBlockId`, main tab, screen size, drawer flags. `useX()` hooks + free `setX()` functions; no reducer, **no undo** (undo/redo is a work-queue item; the onchainsuite fork has an implementation to lift).
- **Shell**: `App/index.tsx` = SamplesDrawer (left) + TemplatePanel (centre) + InspectorDrawer (right).
- **TemplatePanel** switches between `<EditorBlock id="root"/>`, `<Reader/>` preview, HTML and JSON views.
- **InspectorDrawer** → `ConfigurationPanel` dispatches on block type to a `*SidebarPanel`, all built on `BaseSidebarPanel` + reusable inputs under `input-panels/helpers/inputs/`. **This is the ~60-file MUI surface to port** — the panels are highly repetitive, so build `PaddingInput`, `ColorInput`, `FontSelect` etc. once on Radix and reuse.
- **Mutation**: `TuneMenu.tsx` implements move/duplicate/delete by walking every block to find the parent (`findParentBlockId:26`); the same three-case container switch repeats in each handler.
- **Persistence**: none. Documents load from `window.location.hash` — `#sample/<name>` or `#code/<base64>` (`getConfiguration/index.tsx:11`); `ShareButton` encodes back. Autosave/persistence is a work-queue item.

## Where to touch what

| Task                       | Files                                                                                                                                                                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **New block**              | new `packages/block-x/`, then register in **both** `email-builder/src/Reader/core.tsx` **and** `examples/…/documents/editor/core.tsx`, add a `XSidebarPanel`, add a case in `ConfigurationPanel/index.tsx` and `AddBlockMenu/buttons.tsx` |
| Change email HTML output   | the block package's `index.tsx`, or `*Reader.tsx` for containers                                                                                                                                                                          |
| Editor behaviour only      | `documents/blocks/helpers/` (wrappers, `TuneMenu`, `EditorChildrenIds`)                                                                                                                                                                   |
| A block's editable options | `input-panels/*SidebarPanel.tsx` + the block's zod schema                                                                                                                                                                                 |

## Conventions

- Formatting is enforced by prettier (`.prettierrc`) — run it before committing.
- eslint uses `simple-import-sort`; import order is mechanical, let the fixer do it.
- Tests are colocated snapshot tests (`src/index.spec.tsx` per block) plus `document-core/tests/`. **Changing renderer markup will churn snapshots — that is expected for the table-based-markup work; review the diffs rather than blindly updating them.**
- Bump the package `version` when changing a published `block-*`; `email-builder` pins them by caret range.

## Commit policy

There is no CI, so the gate is local and it is not optional. **Nothing is committed on a red build.**

### The gate

```bash
npx prettier . --write && npx eslint . && npx tsc --noEmit && npm test
```

For changes that touch `packages/*`, add `npm run build --workspaces` — `tsup` + `--dts` catches type errors that `tsc --noEmit` at the root does not.

### Commit without asking when

- The gate passes **and** the change is a complete, coherent unit — one work-queue item, one bug fix, one panel ported.
- Docs, config, or tooling only (`CLAUDE.md`, `README.md`, eslint/prettier/tsconfig, workflow removal). The gate still applies where it's meaningful.

### Never commit without asking

- **The gate is red** — failing tests, type errors, lint errors. Report the failure instead. A broken commit is worse than an uncommitted change, because there is no CI to catch it later.
- **Package `version` bumps** in any `packages/*/package.json` — these are publish-affecting, and `email-builder` pins the blocks by caret range.
- **Bulk snapshot updates** (`jest -u`). Renderer changes churn snapshots by design; the diff _is_ the review of the email HTML. Show it, don't absorb it.
- **Mid-refactor states** in the de-MUI + React 19 work — a half-ported panel set that happens to compile is not a coherent unit.
- **Anything you were told to do differently** in the current session. Session instructions outrank this file.

### Never without an explicit request

- `git push` — always ask, every time.
- Committing directly to `main`. Branch first: `git checkout -b <area>/<short-desc>`.
- `git rebase`, `git reset --hard`, force-push, amending a pushed commit, `--no-verify`.

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
