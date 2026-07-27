# Changelog

`@sparkdynamic/email-builder`. This is a hard fork of [usewaypoint/email-builder-js](https://github.com/usewaypoint/email-builder-js) at upstream `ce3e610`, so it has its own version line and does not follow upstream's. It stays on 0.x while the extension API can still change.

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
