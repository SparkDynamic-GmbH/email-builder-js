# Changelog

`@sparkdynamic/email-builder`. This is a hard fork of [usewaypoint/email-builder-js](https://github.com/usewaypoint/email-builder-js) at upstream `ce3e610`, so it has its own version line and does not follow upstream's. It stays on 0.x while the extension API can still change.

## Unreleased

Nothing published yet. Everything below is the divergence from upstream `ce3e610` that the first release will carry.

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

---

## Fork point

Upstream `ce3e610` (2026-02-09), published as `@usewaypoint/email-builder@0.0.10`. Upstream is dormant and we do not track it; see [#1](https://github.com/SparkDynamic-GmbH/email-builder-js/issues/1) and [Cloudwawi#259](https://github.com/SparkDynamic-GmbH/Cloudwawi/issues/259).
