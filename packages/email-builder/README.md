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

## Wiring up your image library

Give the provider an `imageLibrary` and the Image block's panel grows a picker over your own asset store. Every member is optional and the editor adapts to what it gets.

```tsx
<EmailBuilderProvider
  registry={registry}
  initialDocument={doc}
  imageLibrary={{
    // One page of the library. `cursor` is null on the first call, and
    // whatever you last returned as `nextCursor` after that.
    list: async ({ query, cursor, signal }) => {
      const res = await fetch(`/api/media?q=${query}&cursor=${cursor ?? ''}`, { signal });
      const { items, next } = await res.json();
      return { items, nextCursor: next };
    },
    // Store a file and say where it now lives. A bare URL string is fine too.
    upload: async (file, { signal }) => {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/media', { method: 'POST', body, signal });
      if (!res.ok) {
        // The message is what the user sees in the dialog.
        throw new Error('The upload was rejected.');
      }
      return res.json(); // { url, alt?, name?, thumbnailUrl?, id? }
    },
    accept: 'image/png,image/jpeg,image/webp',
    maxFileSizeBytes: 5 * 1024 * 1024,
  }}
>
```

That gets you the built-in dialog: a dropzone, a search box and a paged grid. If you already have an asset manager, skip both and hand off the whole interaction instead — `pick` takes precedence, and the editor renders no dialog of its own:

```tsx
imageLibrary={{ pick: ({ url }) => openMyAssetManager({ selected: url }) }}
```

Resolve with `null` when the user cancels. A chosen image writes the block's `url`, and fills its `alt` only when it has none; width and height are left alone, because an asset's intrinsic size is rarely the size it should render at in an email.

Keep the object stable — module scope, or `useMemo`. Pass no `imageLibrary` and the Image panel is what it always was: a URL field.

## Wiring up your template library

Give the provider a `templateLibrary` and every block on the canvas grows a "Save as template" action in its tune menu, which keeps that block and everything under it as a plain JSON fragment. The saved set you hand back is listed in a Templates tab in the sidebar and offered under the block grid in the add-block menu.

Like the image library, this is callbacks rather than storage: the editor never persists anything and keeps no copy of the list, so nothing has to be invalidated.

```tsx
const [templates, setTemplates] = useState<TBlockTemplate[]>(() => loadTemplates());

<EmailBuilderProvider
  registry={registry}
  initialDocument={doc}
  templateLibrary={{
    templates,
    // `draft` is { name, blockType, rootBlockId, blocks } — plain JSON.
    // Rejecting shows the error's message in the save dialog and leaves it
    // open, so throw something worth reading.
    save: async (draft) => {
      const saved = await api.createTemplate(draft);
      setTemplates((list) => [saved, ...list]);
    },
    // Leave `remove` out and entries cannot be deleted from the editor.
    remove: async (template) => {
      await api.deleteTemplate(template.id);
      setTemplates((list) => list.filter((t) => t.id !== template.id));
    },
  }}
>
```

Every member is optional. `save` alone gets you the action without a list; `templates` alone gets you a read-only library. The list on screen is always your state — the editor does not add a saved draft to it for you.

Inserting renumbers the whole subtree, so one template can sit next to a copy of itself, and a template that references a block type this registry does not have is listed as unsupported rather than offered.

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

MIT. This package is a hard fork of [usewaypoint/email-builder-js](https://github.com/usewaypoint/email-builder-js) (MIT, Copyright (c) 2024 Waypoint (Metaccountant, Inc.)), taken at upstream commit `ce3e610`; the block framework, the renderers and the editor shell originate there. Some changes are lifted from [onchainsuite/email-builder-js](https://github.com/onchainsuite/email-builder-js) (MIT), noted in the commits that do so. See the `LICENSE` and `NOTICE` files shipped alongside this package.
