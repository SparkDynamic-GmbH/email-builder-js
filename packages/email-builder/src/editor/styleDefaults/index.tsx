/**
 * Document-wide styling: the layout's colours and typeface, the defaults a
 * freshly inserted block starts from, and named presets over the pair.
 *
 * All of it lives on the root `EmailLayout` block, so it is part of the
 * document JSON and needs no storage of its own; the host's part is optional
 * and is a callback contract, like the image and template libraries.
 */
export { default as BlockDefaultsPanel } from './BlockDefaultsPanel';
export { StylePresetProvider, useStylePresets } from './context';
export {
  applyStylePreset,
  ApplyStylePresetOptions,
  extractStylePreset,
  getBlockDefaults,
  getStylePresetLayout,
  isStylePresetLibraryUsable,
  resolveNewBlock,
  setBlockDefault,
  setBlockDefaults,
  STYLE_PRESET_LAYOUT_KEYS,
  stylePresetKey,
} from './helpers';
export { BUILT_IN_STYLE_PRESETS } from './presets';
export { default as StylePresetPicker } from './StylePresetPicker';
export { TBlockDefaults, TStylePreset, TStylePresetDraft, TStylePresetLayout, TStylePresetLibrary } from './types';
