import { BUILT_IN_STYLE_PRESETS, TStylePreset, TStylePresetDraft } from '@sparkdynamic/email-builder/editor';

/**
 * Stands in for a host's style-preset store, the same way `templateLibrary.ts`
 * stands in for its template store: the editor hands us a draft and takes a
 * list back, and never persists anything itself. `Cloudwawi.Web` will POST the
 * draft to its own API and hold the list in whatever state it already has.
 *
 * Passing `presets` at all replaces what the editor ships, so the list we give
 * back is the built-in set plus whatever the user saved — the built-ins stay
 * offered, and only the saved ones can be deleted.
 */
const KEY = 'email-builder:style-presets';

/** Enough latency to see the dialog's saving state; a real API supplies its own. */
const FAKE_LATENCY_MS = 400;

function loadOwn(): TStylePreset[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === null ? [] : (JSON.parse(stored) as TStylePreset[]);
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

function store(presets: TStylePreset[]) {
  localStorage.setItem(KEY, JSON.stringify(presets));
}

/** The user's own first, then the shipped ones, which are not theirs to delete. */
function all(own: TStylePreset[]): TStylePreset[] {
  return [...own, ...BUILT_IN_STYLE_PRESETS.map((preset) => ({ ...preset, readOnly: true }))];
}

export function loadStylePresets(): TStylePreset[] {
  return all(loadOwn());
}

export async function saveStylePreset(draft: TStylePresetDraft): Promise<TStylePreset[]> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
  const preset: TStylePreset = {
    id: `style-preset-${Date.now()}`,
    name: draft.name,
    description: 'Saved from this design',
    layout: draft.layout,
    blockDefaults: draft.blockDefaults,
  };
  const own = [preset, ...loadOwn()];
  store(own);
  return all(own);
}

export async function removeStylePreset(preset: TStylePreset): Promise<TStylePreset[]> {
  const own = loadOwn().filter((p) => p.id !== preset.id);
  store(own);
  return all(own);
}
