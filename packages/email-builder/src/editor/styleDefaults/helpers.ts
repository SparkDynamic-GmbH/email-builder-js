/**
 * Reading and writing the document's styling. Kept apart from `index.tsx` for
 * the same reason as the image and template libraries': the panel and the
 * picker both import from here, and going through the barrel would be a cycle.
 */
import { TEditorBlock, TEditorConfiguration, TEditorRegistry } from '../types';

import { TBlockDefaults, TStylePreset, TStylePresetDraft, TStylePresetLayout, TStylePresetLibrary } from './types';

/** The layout fields a preset carries — see {@link TStylePresetLayout}. */
export const STYLE_PRESET_LAYOUT_KEYS = [
  'backdropColor',
  'borderColor',
  'borderRadius',
  'canvasColor',
  'textColor',
  'fontFamily',
] as const satisfies readonly (keyof TStylePresetLayout)[];

/** The root block, when the document has one and it is the layout. */
function getLayout(document: TEditorConfiguration): TEditorBlock | null {
  const root = document.root;
  return root && root.type === 'EmailLayout' ? root : null;
}

/** The document's per-type defaults. Empty when it has none. */
export function getBlockDefaults(document: TEditorConfiguration): TBlockDefaults {
  const stored = getLayout(document)?.data?.blockDefaults;
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? (stored as TBlockDefaults) : {};
}

/** The document's layout styling, as a preset would carry it. */
export function getStylePresetLayout(document: TEditorConfiguration): TStylePresetLayout {
  const data = getLayout(document)?.data ?? {};
  const layout = {} as TStylePresetLayout;
  for (const key of STYLE_PRESET_LAYOUT_KEYS) {
    if (data[key] !== undefined) {
      Object.assign(layout, { [key]: data[key] });
    }
  }
  return layout;
}

/** Whether a value is a plain object worth merging into another. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Lays a stored default over a definition's, section by section: `props` over
 * `props`, `style` over `style`, anything else replaced outright.
 *
 * Section-wise rather than wholesale so that a default carrying only `style` —
 * which is what a preset usually is — keeps the placeholder content the block's
 * definition declares. Deeper values (a padding object, a table's rows) are
 * replaced whole; there is no key inside them a caller would want half of.
 */
function mergeBlockData(base: unknown, override: unknown): unknown {
  if (!isRecord(base) || !isRecord(override)) {
    return override ?? base;
  }
  const merged: Record<string, unknown> = { ...base, ...override };
  for (const section of ['props', 'style'] as const) {
    const from = base[section];
    const to = override[section];
    if (isRecord(from) && isRecord(to)) {
      merged[section] = { ...from, ...to };
    }
  }
  return merged;
}

/**
 * The block to insert for `type`: the document's own default laid over the one
 * the block's definition declares, or the definition's alone when the document
 * has none.
 *
 * The merged result is parsed against the registry's schema, so a default left
 * behind by an older block set, or edited by hand into something the schema
 * rejects, falls back to the definition rather than putting an invalid block
 * into the document.
 */
export function resolveNewBlock(
  registry: TEditorRegistry,
  document: TEditorConfiguration,
  fallback: TEditorBlock
): TEditorBlock {
  const stored = getBlockDefaults(document)[fallback.type];
  if (stored === undefined || stored === null) {
    return fallback;
  }
  const candidate = { type: fallback.type, data: mergeBlockData(fallback.data, stored) };
  const parsed = registry.blockSchema.safeParse(candidate);
  return parsed.success ? (parsed.data as TEditorBlock) : fallback;
}

/** A document update writing `blockDefaults` onto the root block. */
export function setBlockDefaults(document: TEditorConfiguration, blockDefaults: TBlockDefaults): TEditorConfiguration {
  const root = getLayout(document);
  if (!root) {
    return {};
  }
  return { root: { type: root.type, data: { ...root.data, blockDefaults } } };
}

/** The same, for one block type. Passing `undefined` clears that type's entry. */
export function setBlockDefault(
  document: TEditorConfiguration,
  type: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): TEditorConfiguration {
  const next = { ...getBlockDefaults(document) };
  if (data === undefined) {
    delete next[type];
  } else {
    next[type] = data;
  }
  return setBlockDefaults(document, next);
}

/** Lifts the document's current styling out as a preset the host can store. */
export function extractStylePreset(document: TEditorConfiguration, name: string): TStylePresetDraft {
  return {
    name,
    layout: getStylePresetLayout(document),
    blockDefaults: getBlockDefaults(document),
  };
}
export type ApplyStylePresetOptions = {
  /**
   * Also restyle the blocks already in the document: every block whose type the
   * preset has a default for gets that default's `style` laid over its own,
   * leaving `props` — the user's content — alone. Off by default, because a
   * preset is otherwise only about the layout and what comes next.
   */
  restyleExistingBlocks?: boolean;
};

/**
 * The document's defaults with the preset's laid over them, type by type and
 * then section by section within a type.
 *
 * Merged rather than replaced so that a preset says only what it is about: one
 * that themes Text and Button leaves the Heading default the user set alone,
 * and one carrying `style` alone does not drop a `props` default under the same
 * type. The cost is that a preset cannot take a default away, only overwrite
 * it — clearing one is what the panel's reset button is for.
 */
function mergeBlockDefaults(document: TEditorConfiguration, preset: TStylePreset): TBlockDefaults {
  const current = getBlockDefaults(document);
  const merged: TBlockDefaults = { ...current };
  for (const [type, entry] of Object.entries(preset.blockDefaults ?? {})) {
    merged[type] = mergeBlockData(current[type], entry);
  }
  return merged;
}

/**
 * Applies a preset, returning the whole document so the change lands as one
 * undo step.
 *
 * The layout keeps its `preheader` and `childrenIds`: a preset is styling, and
 * those are content. A restyled block that the schema then rejects is left as
 * it was rather than dropped.
 */
export function applyStylePreset(
  registry: TEditorRegistry,
  document: TEditorConfiguration,
  preset: TStylePreset,
  { restyleExistingBlocks = false }: ApplyStylePresetOptions = {}
): TEditorConfiguration {
  const root = getLayout(document);
  const blockDefaults = mergeBlockDefaults(document, preset);
  const next: TEditorConfiguration = { ...document };

  if (root) {
    next.root = { type: root.type, data: { ...root.data, ...(preset.layout ?? {}), blockDefaults } };
  }

  if (!restyleExistingBlocks) {
    return next;
  }

  for (const [id, block] of Object.entries(document)) {
    if (id === 'root') {
      continue;
    }
    // The preset's own entries, not the merged map: a restyle should reach the
    // types this preset actually brought, not every type the document happens
    // to hold a default for and that the user never asked to touch.
    const style = preset.blockDefaults?.[block.type]?.style;
    if (!isRecord(style)) {
      continue;
    }
    const candidate = {
      type: block.type,
      data: { ...block.data, style: { ...(isRecord(block.data?.style) ? block.data.style : {}), ...style } },
    };
    const parsed = registry.blockSchema.safeParse(candidate);
    if (parsed.success) {
      next[id] = parsed.data as TEditorBlock;
    }
  }
  return next;
}

/** React key and `remove` identity for a preset, as with templates. */
export function stylePresetKey(preset: TStylePreset): string {
  return preset.id ?? preset.name;
}

/** Whether the library gives the editor anything to show. */
export function isStylePresetLibraryUsable(library: TStylePresetLibrary | null | undefined): boolean {
  if (!library) {
    return false;
  }
  return (library.presets?.length ?? 0) > 0 || typeof library.save === 'function';
}
