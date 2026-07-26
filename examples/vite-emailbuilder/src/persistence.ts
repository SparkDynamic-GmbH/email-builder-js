import { EditorConfigurationSchema, TEditorConfiguration } from './registry';

/**
 * Stands in for a host's backend. `localStorage` here; `Cloudwawi.Web` will be
 * an API call — the shape the editor cares about is the same either way: a
 * promise that resolves when the document is persisted and rejects when it is
 * not.
 */
const KEY = 'email-builder:draft';

/** Enough latency to see the button's saving state; a real API supplies its own. */
const FAKE_LATENCY_MS = 400;

export function loadDraft(): TEditorConfiguration | null {
  const stored = localStorage.getItem(KEY);
  if (stored === null) {
    return null;
  }
  try {
    // Persisted JSON is untrusted — it may predate a schema change. Validate it
    // rather than letting a stale document render as broken blocks.
    const parsed = EditorConfigurationSchema.safeParse(JSON.parse(stored));
    if (parsed.success) {
      return parsed.data;
    }
    console.error('Discarding the stored draft: it does not match the current schema.', parsed.error);
  } catch {
    console.error('Discarding the stored draft: it is not valid JSON.');
  }
  localStorage.removeItem(KEY);
  return null;
}

export async function saveDraft(document: unknown): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
  localStorage.setItem(KEY, JSON.stringify(document));
}

export function clearDraft() {
  localStorage.removeItem(KEY);
}
