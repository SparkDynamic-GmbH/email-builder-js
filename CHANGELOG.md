# Changelog

`@sparkdynamic/email-builder`. This is a hard fork of [usewaypoint/email-builder-js](https://github.com/usewaypoint/email-builder-js) at upstream `ce3e610`, so it has its own version line and does not follow upstream's. It stays on 0.x while the extension API can still change.

## Unreleased

### Added — style presets and per-block defaults

- **A document's styling now covers what a new block starts from.** `EmailLayout` grows a `blockDefaults` map, keyed by block type, and the add-block menu lays that entry over the one the block's definition declares — so a Text block added after the padding is set arrives with that padding, rather than the built-in 16/24. The merge is section-wise, props over props and style over style, so an entry carrying only `style` keeps the placeholder content the definition gives; the result is parsed against the registry's schema before it is used, so a default left behind by an older block set falls back to the definition instead of putting an invalid block into the document.
- **A style preset is that pair named**: the layout's colours, border and typeface, plus the defaults map. Three ship in the package — Default, Compact, Editorial — and a host serves its own through the provider's `stylePresets` prop. Same callback contract as the image and template libraries, because the styling lives on the document's root block and the editor persists nothing; leaving the prop out offers the built-ins, and `{ presets: [] }` offers none. Applying one **merges** into the document's block defaults rather than replacing them — type by type, then section by section within a type — so a preset that themes Text and Button leaves the Heading default you set standing, and a style-only preset does not drop a `props` default under the same type. The trade is that a preset can overwrite a default but never take one away; the panel's reset button does that.
- **Applying one is a single document write**, so it is one undo step. Whether it also restyles the blocks already on the canvas is asked in the dialog rather than assumed — a restyle overwrites styling the user may have set deliberately — and it reaches only the types the preset itself named, replacing their `style` and never their content.
- **Presets are their own tab in the inspector**, next to Templates and on the same terms: the tab exists only when there is a library behind it, and the list is the host's array rendered as it comes. The Styles tab keeps the Global fields and the Block defaults accordion under them. A block's default is edited through that block's own inspector panel against a stand-in block, so there is no second set of inputs to keep in step, and a host's own block is covered without writing anything.
- **A user can save the current styling as a preset and delete their own again**, which is what makes the host's `save`/`remove` callbacks the whole story: the editor stores nothing, so a host POSTs the draft to its API and hands the list back through `presets`. A preset carrying `readOnly` shows no delete affordance, which is how a host offers a shipped set alongside the user's own without inviting them to delete it.
- `extractStylePreset` lifts the current styling out as a draft, the way `extractBlockTemplate` does for a subtree. New `Accordion` primitive, and the `stylePresets.*` and `styleDefaults.*` keys in every language.

### Fixed

- **The translation catalogs were mojibake in four languages.** The strings added with the style presets had been written UTF-8 and read back as cp1252, so German, French and Italian rendered `BlÃ¶cke`, `prÃ©rÃ©glage` and the like, and every catalog's `Saving…` had lost its ellipsis. All four are repaired.
- **The Global panel's font-family field showed the wrong value.** Its `defaultValue` was the literal `MODERN_SANS`, so the select read Modern sans however the layout was actually set.
- **The Styles tab now follows a document written from outside it.** Its inputs are uncontrolled, so applying a preset left the fields showing what they mounted with; they remount on an external write and only then, so dragging one of their own sliders still works.

### Added — JSON import and export

- **The document can be taken out as a file and read back in.** `ExportJsonButton` downloads the current document as JSON (`fileName` names the download, `email-template.json` by default); `ImportJsonButton` opens a dialog that takes it pasted or picked as a `.json` file and replaces the document with it. Both are host chrome, like `SaveButton` — put them in your toolbar.
- **The import validates against the provider's own registry**, not a schema the host has to pass in: a document written for a different block set is refused with a message rather than throwing on the canvas, and one without a `root` block is refused separately, since rendering starts there. `parseDocumentJson` and `documentToJson` are exported for a host that wants the check without the dialog.
- **An import clears the undo history.** The states before it are not steps the user took in the document they now have — the same rule a template load already followed.
- The catalogs gain the `json.*` keys, in every language. The sample app dropped its own copies of these controls and uses the package's.

## 0.1.6 — 2026-08-18

### Fixed — the export was missing its head, and columns never stacked

- **The exported document now has a real `<head>`.** It rendered `<html><head></head><body>` — React's empty head, and nothing in it. Four things every email needs were missing, each with a visible symptom: no charset, so a saved file mangles umlauts; no viewport, so a phone lays the message out at desktop width and scales it down; no Outlook `PixelsPerInch`, so Word scales the whole email by 4/3 on a Windows display above 96 DPI; and no body margin reset, so the client's default 8px gutter shows through where the backdrop colour never reaches. The head is concatenated as a string rather than rendered, because a conditional comment is not a node React can emit.
- **A `ColumnsContainer` stacks below 600px.** A column renders a real table cell and cells never wrap, so a 600px two-up row stayed 600px on a phone and forced the whole email to scroll sideways. The new `stackOnMobile` prop — **on by default** — marks each cell `eb-column`, and below the breakpoint the cell stops being a cell and takes the full width; the horizontal gap padding goes with it, since stacked it would only indent one column against the other. Turning it off is a real choice: a 44px number beside its text reads worse stacked than squeezed.
- **The stacking rule is written twice on purpose.** The export carries a `@media` query in its head; the canvas and preview need a `@container` query against `eb-canvas`, because the mobile toggle narrows a _box_ to 370px inside a window that is still full width, so a viewport query would never match and the canvas would show columns the email had already stacked. Same class, same breakpoint. A host rendering the reader itself has to put `eb-canvas` on its own wrapper, as the sample app's preview tab does.

### Added — three blocks gained the shape they were missing

- **`Divider` can be narrower than its block.** `lineWidth` sets the rule's own width and `align` places it left/center/right; both are absent by default, so an existing document renders unchanged. Alignment goes out twice, the way background colour and text alignment already do — Word honours the `align` attribute and ignores `margin: auto`, and every browser-based client does the opposite.
- **`Container` can draw its border per side.** `borderWidth` gives the four sides their own widths, and only the sides that have one are declared, so a `0` side drops out of the markup entirely — a callout or a quote with a single accent rule down one edge no longer needs an Html block. Absent, it still means the uniform 1px it always drew, so a document written before this renders byte for byte the same. The inspector shows the widths only once there is a border colour for them to be drawn in.
- **`Text` can shrink its background to the text.** A Text block's background filled the whole width, so an eyebrow label or a chip came out as a full-width band. `inlineBackground` puts the text in a table of its own, as wide as its content; `backgroundPadding` is that background's own inset, since `padding` stays the block's outer spacing. The inspector shows it only once the switch is on. A span with `display: inline-block` is not an alternative — Word collapses it back to full width.
- The catalogs gain `field.stackOnMobile`, `field.inlineBackground` and `field.backgroundPadding`, in every language.

## 0.1.5 — 2026-08-18

### Added — template library

- **A block can be kept as a reusable partial.** A block's tune menu grows a "Save as template" action that lifts it and everything under it into a plain JSON fragment, and the saved set comes back in a Templates tab in the sidebar and under the block grid in the add-block menu.
- **The contract mirrors the image library: callbacks, not storage.** The provider's new `templateLibrary` prop takes `save`, `remove` and `templates`. `save` hands the host `{name, blockType, rootBlockId, blocks}`; the host hands its own list back as `templates`, so the editor keeps no copy and nothing has to be invalidated. Every member is optional — `save` alone gets the action without a list, `templates` alone a read-only library, and no prop at all changes nothing about the editor.
- **Inserting renumbers the whole subtree**, so one template can sit next to a copy of itself, and a template that names a block type the registry does not have is listed as unsupported rather than offered.
- `helpers/blockChildren.ts` is now the one place that knows which blocks hold children — the template walk, the renumber, the insert and `TuneMenu`'s parent lookup all go through it rather than repeating the container switch a fourth time. `EditorChildrenIds`' change carries blocks keyed by id, since a template is more than one block.
- New exports from `./editor`: `SaveTemplateButton`, `TemplateLibraryPanel`, `TemplateLibraryProvider`, `useTemplateLibrary`, `useInsertBlockTemplate`, `useIsTemplateSupported`, `extractBlockTemplate`, `instantiateBlockTemplate`, `isBlockTemplateContent`, `isTemplateLibraryUsable`, `templateBlockCount`, `templateBlockTypes`, `templateKey`, and the `TBlockTemplate` / `TBlockTemplateContent` / `TBlockTemplateDraft` / `TTemplateLibrary` types.
- The catalogs gain `inspector.tab.templates` and the `templates.*` keys, in every language.

### Added — links in rich text

- **The selection toolbar can wrap a selection in a link.** A link button opens a small panel with the address and an "Open in a new tab" toggle, and Apply wraps the selection — or retargets the link the caret is already in. A bare `example.com` becomes `https://example.com` and a bare address becomes `mailto:`, since the sanitizer only passes http, https and mailto.
- **Clicking a link on the canvas opens its settings instead of following it.** Selecting a link's block and clicking the link lands the caret inside it, which shows the toolbar over the link with its address filled in and a Remove link button. Following the link would take the editor's own page with it, so the click's default is prevented either way.
- **Remove link** unwraps the anchor and keeps its words, from either the toolbar button or the panel.
- The link panel is the one part of the toolbar allowed to take focus, because its field has to be typed into: the range is saved on every read of the selection and restored before a command runs, and `InlineEditable` treats a blur into the toolbar as no blur at all rather than committing the block.
- `normalizeRichText` now unwraps an anchor with no address and keeps `target` only when it is `_blank`. The tags and attributes themselves were already allowed through `sanitizeRichText`; what was missing was the UI.
- The canvas puts a link's browser default look back — blue and underlined — which a host's preflight strips but the email clients rendering the same markup apply. Without it a link is indistinguishable from the words around it.
- **A link can be styled.** The link panel gains a colour grid, with a Default swatch that leaves the colour to the client, and an "Underline the link" toggle. Both are written onto the `<a>` itself rather than a span inside it, because a client's own link rule — blue and underlined — targets `a` and outranks anything a descendant declares; picking a colour also clears `color` off spans under the anchor, which would otherwise win in a browser and make the choice look like it had not applied. Opening the panel on an existing link seeds both from it.
- `text-decoration` is now allowed on an anchor, and only on an anchor, in both `normalizeRichText` and `sanitizeRichText`: a link is a single element with a single decoration, so there is nothing for it to contradict — unlike a span, where the four marks own it.
- The toolbar now measures itself to decide whether to sit above or below the selection, instead of assuming the height of its button row. With the link panel open it is several times taller, and a selection near the top of the canvas used to push its fields off-screen.
- The catalogs gain `richText.link`, `richText.editLink`, `richText.removeLink`, `richText.linkUrl`, `richText.linkPlaceholder`, `richText.linkNewTab`, `richText.linkApply`, `richText.linkColor`, `richText.linkColorDefault` and `richText.linkUnderline`, in every language.

## 0.1.4 — 2026-07-27

### Added

- **The Button block's `url` is now required to save.** `BlockDefinition` gains an optional `validate` hook, aggregated into `registry.validateDictionary`; `save()` checks every block against it before calling `onSave`, and refuses — selecting the offending block and opening its panel — if one fails. Button's panel marks the field "Url \*" with an inline error when it's empty.

### Fixed

- **The image library's upload dropzone could silently fail to open the native file picker**, most visibly when opened from a canvas block's hover overlay. `EditorBlockWrapper` wraps every canvas block in an `onClick` that calls `preventDefault()` to select the block; because `Dialog.Content` renders through a Portal, its DOM sits outside the canvas, but React bubbles synthetic events along the component tree, not the DOM tree — a click anywhere in a dialog opened from a canvas control still reached that `preventDefault()`, which silently cancelled the dropzone `<label>`'s native file-picker activation. `Dialog.Content` now stops a click from propagating past itself, so no dialog can be intercepted by whatever triggered it on the canvas.
- Along the way, the dropzone's hidden `<input type="file">` moved from a `<button>` + `fileInputRef.current.click()` to a native `<label>` wrapping the input (more reliable than a JS-triggered click), and picked up `cursor-pointer` — which `Button`/`IconButton`, the shared primitives behind nearly every button in the editor, were also missing, since this package ships with no Tailwind preflight.
- **New Button/Image/Card blocks no longer default to a `usewaypoint.com` link.** Placeholder defaults now point at `example.com`/`placehold.co`.

## 0.1.3 — 2026-07-27

### Added — undo/redo

- **The editor keeps a history.** `undo()` and `redo()` on `useEditorActions()`, `useCanUndo()`/`useCanRedo()` to drive a UI off it, and a `UndoRedoButtons` component for a host's toolbar. Every document mutation goes through `setDocument`/`resetDocument`, so canvas edits, inspector edits and the block menu are all covered without each call site knowing about it.
- **Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y) are bound on the window**, unless the provider is given `undoRedoHotkeys={false}` — which is what a host with two editors on one page, or its own bindings, wants. Keystrokes inside a field or an inline editable are left to the browser: its undo owns the caret there, and the edit is not in the document yet.
- **A run of like edits is one step.** Writes to the same block less than 500 ms apart collapse, so undoing a slider or colour drag puts the value back rather than stepping one tick. Edits to different blocks never collapse, however close together they land.
- **Undo restores the selection as well as the document**, so stepping back through a delete puts the inspector back on the block it was on.
- `resetDocument` takes `{ clearHistory: true }` for loading a different template — the states before it are not steps the user took in this one. The host app passes it when a sample is picked or JSON is imported.
- History is capped at 100 steps; snapshots are structurally shared, so a step costs the objects the edit replaced and nothing more.
- The catalogs gain `history.undo` and `history.redo`, in every language.

### Added — Card block

- **A `Card` block** — image + heading + body + button, previously only reachable by combining other blocks by hand. Image position is `top`/`left`/`right`, plus card background, border and radius. Table-based markup throughout, including the button. Registered in the built-in reader dictionary too.
- **`Card` is a container**, not a fixed leaf: its heading/body/button seed as ordinary removable children (`childrenIds`), so they can be added to, removed or reordered like `Container`/`ColumnsContainer` content. The image stays fixed chrome. `TuneMenu`'s move/duplicate/delete and `cloneDocumentBlock` gained a `Card` case alongside `Container`.
- **Clicking the card's (and the standalone Image block's) canvas image opens the image library** — the host's, or the built-in dialog — the same interaction as `ImagePickerButton` in the sidebar. The image itself is inert to clicks; a "Pick image from media library" overlay button, centered and shown on hover, is the only click target that opens it, so clicking elsewhere on the image still selects the block. `ImagePickerButton` grew a `renderTrigger` prop so this overlay and the Card/Image editors share one implementation instead of each keeping their own dialog state.
- The catalogs gain `block.Card`, `panel.Card` and the new field labels, in every language.

### Fixed

- **Duplicating a top-level block, then undoing, no longer corrupts the document.** `cloneDocumentBlock`'s shallow copy left every untouched entry — including the parent whose children array the duplicate handler then spliced in place — as the same object reference sitting in the undo stack's most recent snapshot; undoing the duplicate mutated that snapshot retroactively and crashed the editor. Move/duplicate/delete now all copy the parent's children array before splicing, instead of two of the three doing so.

## 0.1.2 — 2026-07-26

### Changed — rich text in the Text block

- **Select text on the canvas and a toolbar follows it**, with bold, italic, underline, strikethrough, colour and clear-formatting. It needs no setup: every Text block is rich, so the toolbar is always one drag away.
- **BREAKING — `props.markdown` is gone, and so is plain text.** `props.text` is now always a fragment of inline HTML. Text written by hand — in a host's fixtures or a seeded document — must arrive **HTML-escaped**; a literal `<` or `&` will otherwise be read as markup. Plain words are still valid rich text, so nothing else changes for content that has none.
- The markdown renderer (`EmailMarkdown.tsx`, `marked`) is **removed**, and `marked` is dropped from the dependencies. `insane` stays: it now sanitizes the inline marks instead. An `Html` block remains the escape hatch for markup the toolbar cannot write.
- **The Text panel has no content field.** A textarea could only show the marks as raw markup and let them be hand-edited into something the sanitizer rewrites; the canvas is where a Text block is written now. The panel still owns colour, background, font, size, weight, alignment and padding.
- Marks are stored and exported as **semantic tags** — `<strong>`, `<em>`, `<u>`, `<del>` — with `<span style>` reserved for colour, background and size, because Word renders those tags reliably but is patchy on `text-decoration` written as CSS. Weight, slant and decoration are never stored as CSS: a span declaring one outranks an enclosing tag, which would stop a block from being bolded as a whole. Padding stays on the `td` and the table wrapper is unchanged.
- Whatever a browser produced is reconciled on commit: Chrome's `<b>` and per-line `<div>`, Firefox's spans, and `rgb()` colours all become one vocabulary. Rendering sanitizes again, allowing inline tags only plus a style-property allowlist.
- The catalogs gain `richText.*` and lose `field.markdown`, in every language.

### Added — Table block

- **A `Table` block**, for order summaries, pricing lines and event schedules — previously only reachable by hand-writing markup in an `Html` block. Cells hold plain strings, so it is a leaf block: no `childrenIds`, and nothing for a host's `cloneDocumentBlock` to learn.
- **Cells are edited on the canvas**, one `InlineEditable` each. The canvas variant passes a `renderCell` prop into the renderer rather than duplicating the markup, so the cell you type in is the cell the email ships. Add-row/add-column and delete-row/delete-column controls appear under the table while it is selected and act on the cell the caret was last in.
- **Columns are resized by dragging their border on the canvas.** Widths are stored as shares and divided by their total when rendered, so a drag moves one pair of columns and leaves the rest untouched, and `[2,1,1]` describes the same table as `[50,25,25]`. They render as percentages of a 100%-wide table — proportional on a phone, unlike pixel widths — and switch the grid to `table-layout: fixed`, without which the widest cell still wins. A drag starts from the widths the columns actually have on screen, so the first one adjusts the boundary it was given rather than snapping to equal columns.
- **A minimum row height**, named as a minimum on purpose: content taller than it still wins, in every client. Emitted as the `height` attribute as well as the property.
- Editable from the inspector: header row on/off with its own background and text colour, striped row colour, border colour and width, cell padding, minimum row height, per-column alignment, plus the usual text colour, background, font family, font size and padding.
- Table-first markup from the start: borders on the cells, background as both CSS and `bgcolor`, alignment as both `text-align` and `align`, and a non-breaking space in empty cells, which otherwise collapse and lose their borders in Word. The inner grid keeps `th`/`scope` semantics; only the wrapper table is `role="presentation"`.
- Registered in the built-in reader dictionary too, so a consumer that only renders email gets it without registering anything.
- The catalogs gain `block.Table`, `panel.Table`, the new field labels and `table.*`, in every language.

### Added — image library

- **`imageLibrary` on `EmailBuilderProvider`**, so a host can wire its own asset store into the Image block. Three callbacks, all optional, and the editor adapts to whichever it is given: `upload(file, {signal})` stores a file and returns where it now lives, `list({query, cursor, signal})` returns one page of the library, `pick({url})` takes over the whole interaction for a host that already has an asset manager. `accept` and `maxFileSizeBytes` are enforced before `upload` is called.
- **A picker dialog in the package**, driven by `upload`/`list` — a dropzone with drag-and-drop, a debounced search box, a cursor-paged grid, and per-request cancellation on close. `pick` takes precedence over it when both are given.
- The Image panel is unchanged for a host that passes no `imageLibrary`: a URL field and nothing else.
- A chosen image writes `url`, and fills `alt` only when the block has none. Width and height are deliberately left alone — an asset's intrinsic size is rarely the size it should render at in an email.
- **`useImageLibrary()`, `ImagePickerButton`, `ImageLibraryDialog`, `ImageLibraryProvider`** and the `TImageLibrary*` types are exported from `./editor`, so a host's own blocks can reuse the same store.
- The catalogs gain `imageLibrary.*`, in every language.

### Added — i18n

- **`language` on `EmailBuilderProvider`**, an ISO 639-1 code; `en` (default), `de`, `fr` and `it` ship. It covers the editor's chrome — panels, labels, menus, tooltips, the save button — not the document, which is the user's own content.
- **`translations`**, a partial override map for rewording a built-in string, adding keys for a host's own blocks, or supplying a language we do not ship. Lookup order is override → language → English → the key.
- **`useTranslate()`, `useLanguage()`, `createTranslate()` and `I18nProvider`** exported from `./editor`, so a host's chrome reads from the same catalog as the editor. `t(key, params)` fills `{name}` placeholders.
- English is the source of truth for the key set: every other catalog is typed against it, so a new key does not compile until it is translated, and a test asserts each catalog covers the English key set exactly.
- Add-block labels resolve under `block.<type>` and fall back to the label the definition gave, so a block a host registered keeps working untranslated.

### Added — saving

- **`onSave` on `EmailBuilderProvider`**, with the state a host needs around it: a `save()` action, `useSaveStatus()`, `useSaveError()` and `useIsDirty()`. `save()` snapshots the document, so edits made while a save is in flight stay dirty; a second call joins the one in flight rather than racing it; a rejection is recorded and leaves the document dirty. `markSaved()` covers a host that persisted by some other route.
- **`SaveButton`**, exported from `./editor` — save / saving / saved / retry, driven off that state. Renders nothing when the provider was given no `onSave`.
- **Autosave, off by default.** `autosave` turns it on; `autosaveDebounceMs` sets the delay, default 10 000 ms, trailing edge, so a run of keystrokes or slider ticks saves once with the latest document. A pending autosave is flushed on unmount.
- `onChange` is unchanged — every document change, undebounced — but is now read through a ref, so passing a new closure each render no longer resubscribes.

## 0.1.1 — 2026-07-26

The first release built and published by CI, with provenance. Everything below is the divergence from upstream `ce3e610`.

Also fixed here: `dist` is cleaned before each build, so stale chunks from earlier builds no longer end up in the tarball (0.1.0 shipped six of them).

### Changed — packaging

- **One package instead of twelve.** `document-core` and the ten `block-*` packages are folded into `@sparkdynamic/email-builder`. Subpath exports let a consumer take only what it needs: `./extensions`, `./blocks`, `./reader`, `./editor`, plus `.` for everything.
- **ESM only**, with `.d.mts` types, sourcemaps and `src/` in the tarball — you can step into real source instead of a bundle.
- Peers narrowed to `react` 19, `react-dom` 19, `zod` 3.

### Changed — the editor

- **React 19 and no MUI.** The shell and every sidebar panel are rebuilt on Tailwind 4 + Radix. Upstream closed three community React 19 PRs unmerged; this is that work done.
- **The editor is a library.** `EmailBuilderProvider` owns one editor's state, so a host supplies the document and gets changes back through `onChange`; two providers on a page are two independent editors. Upstream's module-level singleton store, seeded from `window.location.hash`, is gone.
- **Styling ships compiled.** `@sparkdynamic/email-builder/styles.css` carries the editor's tokens and utilities with no preflight, so it composes with a host's own reset. `./theme.css` is the raw token file for a host's own Tailwind build.
- **In-place text editing** on the canvas.
- The samples drawer and the Waypoint promo block are removed. The sample documents themselves are kept and still load from `#sample/<name>`.

### Added — extension API

- **A block is declared once.** A `BlockDefinition` carries a block's schema, its email renderer, its canvas variant, its inspector panel and its add-block menu entry; `buildBlockRegistry` derives the reader dictionary, the canvas dictionary, one shared document schema, the inspector dispatch and the menu from a dictionary of them. Registering a block used to mean editing four unconnected places.
- **`createReader(blocks)`** builds a reader over any block set, so a registered block renders in the preview and the HTML export as well as on the canvas — not only on the canvas.

### Removed

- GitHub Actions CI. The gate is local and mandatory; the only workflow here publishes on a tag.

## 0.1.0 — 2026-07-26

Published by hand, only to create the package so a trusted publisher could be configured on it — npm cannot do a package's first publish over OIDC. Same content as 0.1.1 apart from six stale build chunks, but built locally and **without provenance**. Prefer 0.1.1.

---

## Fork point

Upstream `ce3e610` (2026-02-09), published as `@usewaypoint/email-builder@0.0.10`. Upstream is dormant and we do not track it; see [#1](https://github.com/SparkDynamic-GmbH/email-builder-js/issues/1) and [Cloudwawi#259](https://github.com/SparkDynamic-GmbH/Cloudwawi/issues/259).
