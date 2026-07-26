# @sparkdynamic/email-builder

Email editor and renderer: a block registry, an editor canvas, a property inspector, and email HTML output.

Not published yet — the release workflow is still being set up. Until then, consume it with `npm link` or a `file:` override (see [Local development](#local-development)).

## Install

```bash
npm install @sparkdynamic/email-builder
```

Peers: `react` 19, `react-dom` 19, `zod` 3.

## Entry points

Take only what you need:

| Import                                   | What it gives you                                                                       |
| ---------------------------------------- | --------------------------------------------------------------------------------------- |
| `@sparkdynamic/email-builder/extensions` | the block-definition and registry API — declare a block type, derive everything from it |
| `@sparkdynamic/email-builder/blocks`     | the built-in block renderers with their zod schemas, props types and defaults           |
| `@sparkdynamic/email-builder/reader`     | `Reader`, `createReader`, `renderToStaticMarkup` — a document to email HTML             |
| `@sparkdynamic/email-builder/editor`     | the provider, canvas, inspector, ui primitives and built-in block definitions           |
| `@sparkdynamic/email-builder`            | all of the above                                                                        |
| `@sparkdynamic/email-builder/styles.css` | the editor's compiled stylesheet; `./theme.css` is the raw design-token file            |

ESM only, with `.d.mts` types, sourcemaps and `src/` in the published tarball, so you can step into real source rather than a bundle.

## Rendering a document

```tsx
import { renderToStaticMarkup } from '@sparkdynamic/email-builder/reader';

const html = renderToStaticMarkup(document, { rootBlockId: 'root' });
```

`document` is flat — `Record<blockId, { type, data }>` — and nesting is by id reference, so containers hold `childrenIds`. `ReaderDocumentSchema` validates arbitrary JSON into a typed document.

## Mounting the editor

```tsx
import '@sparkdynamic/email-builder/styles.css';

import { buildBlockRegistry } from '@sparkdynamic/email-builder/extensions';
import {
  BUILT_IN_BLOCK_DEFINITIONS,
  EditorBlock,
  EditorBlockWrapper,
  EmailBuilderProvider,
  InspectorDrawer,
} from '@sparkdynamic/email-builder/editor';

const registry = buildBlockRegistry(BUILT_IN_BLOCK_DEFINITIONS, { EditorBlockWrapper });

<EmailBuilderProvider registry={registry} initialDocument={doc} onChange={save}>
  <EditorBlock id="root" />
  <InspectorDrawer />
</EmailBuilderProvider>;
```

The provider owns one editor's state, so two of them on a page are two independent editors. Everything around the canvas and the inspector — toolbar, view tabs, loading, saving — is yours; `examples/vite-emailbuilder` is a worked example of exactly that.

Import `styles.css` **before** your own stylesheet. It ships no preflight, and its first line fixes the cascade-layer order so your reset cannot outrank the editor's utilities.

## Registering your own block

A block is declared once, as a `BlockDefinition`: its schema, how it renders in email, how it renders on the canvas, its inspector panel, and its add-block menu entry. `buildBlockRegistry` derives the reader dictionary, the canvas dictionary, the document schema, the inspector dispatch and the menu from a dictionary of them.

```tsx
import { buildBlockDefinitionDictionary, buildBlockRegistry } from '@sparkdynamic/email-builder/extensions';
import { BUILT_IN_BLOCK_DEFINITIONS, EditorBlockWrapper } from '@sparkdynamic/email-builder/editor';
import { createReader } from '@sparkdynamic/email-builder/reader';

const blocks = buildBlockDefinitionDictionary({
  ...BUILT_IN_BLOCK_DEFINITIONS,
  ProductPicker: {
    schema: ProductPickerPropsSchema,
    Reader: ProductPicker,
    Editor: ProductPickerEditor,
    SidebarPanel: ProductPickerSidebarPanel,
    menu: { label: 'Product', icon: <Package />, defaults: () => ({}) },
  },
});

const registry = buildBlockRegistry(blocks, { EditorBlockWrapper });
const { Reader, renderToStaticMarkup } = createReader(registry.readerDictionary);
```

Because the reader is built from the same definitions as the canvas, a registered block renders on the canvas, in the preview and in the exported HTML alike.

## Local development

The editor SPA in `examples/vite-emailbuilder` consumes this package as a workspace, so it exercises the same public entry points a consumer does.

```bash
npm ci                                       # from the repo root
npm run build --workspace=packages/email-builder
cd examples/vite-emailbuilder && npx vite
```

To develop against this package from another repository, `npm link` it or point at it with a `file:` dependency, and rebuild the package after each change — the app resolves `dist`, not `src`.

## Licence and attribution

MIT. This package is a hard fork of [usewaypoint/email-builder-js](https://github.com/usewaypoint/email-builder-js) (MIT, Copyright (c) 2024 Waypoint (Metaccountant, Inc.)), taken at upstream commit `ce3e610`; the block framework, the renderers and the editor shell originate there. Some changes are lifted from [onchainsuite/email-builder-js](https://github.com/onchainsuite/email-builder-js) (MIT), noted in the commits that do so. See `LICENSE` and the repository's `NOTICE`.
