import type { TBlockTemplate, TBlockTemplateDraft } from '@sparkdynamic/email-builder/editor';

/**
 * Stands in for a host's template store, the same way `persistence.ts` stands
 * in for its backend. `Cloudwawi.Web` will POST the fragment to its own API and
 * hold the list in whatever state it already has.
 *
 * The point of the editor's contract is exactly this shape: it hands us a JSON
 * fragment and takes a list back, and never touches storage itself.
 */
const KEY = 'email-builder:templates';

/** Enough latency to see the dialog's saving state; a real API supplies its own. */
const FAKE_LATENCY_MS = 400;

export function loadTemplates(): TBlockTemplate[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === null ? [] : (JSON.parse(stored) as TBlockTemplate[]);
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

function store(templates: TBlockTemplate[]) {
  localStorage.setItem(KEY, JSON.stringify(templates));
}

/** Newest first, which is the order the editor renders them in. */
export async function saveTemplate(draft: TBlockTemplateDraft): Promise<TBlockTemplate[]> {
  await new Promise((resolve) => setTimeout(resolve, FAKE_LATENCY_MS));
  const template: TBlockTemplate = {
    id: `template-${Date.now()}`,
    name: draft.name,
    description: draft.blockType,
    rootBlockId: draft.rootBlockId,
    blocks: draft.blocks,
  };
  const templates = [template, ...loadTemplates()];
  store(templates);
  return templates;
}

export async function removeTemplate(template: TBlockTemplate): Promise<TBlockTemplate[]> {
  const templates = loadTemplates().filter((t) => t.id !== template.id);
  store(templates);
  return templates;
}
