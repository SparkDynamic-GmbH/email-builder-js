import { collectSubtreeIds, generateBlockId, mapBlockChildrenIds } from '../helpers/blockChildren';
import { TEditorConfiguration } from '../types';

import { TBlockTemplate, TBlockTemplateContent, TTemplateLibrary } from './types';

/**
 * A JSON round trip rather than `structuredClone`: a template is JSON the host
 * stores and hands back, so anything that would not survive the trip has no
 * business being in one — and this says so at the point where it matters.
 */
function toJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Whether a library does anything at all — nothing to save with, nothing to insert. */
export function isTemplateLibraryUsable(library: TTemplateLibrary): boolean {
  return Boolean(library.save) || (library.templates?.length ?? 0) > 0;
}

/** Identity for keys and for `remove`; `id` when the host has one, else the name. */
export function templateKey(template: TBlockTemplate): string {
  return template.id ?? template.name;
}

/**
 * Lifts a block and its descendants out of a document into a self-contained
 * fragment. The ids are kept as they are — they are renumbered on the way back
 * in, so a template inserted twice is two separate subtrees.
 */
export function extractBlockTemplate(document: TEditorConfiguration, blockId: string): TBlockTemplateContent {
  const blocks: TEditorConfiguration = {};
  for (const id of collectSubtreeIds(document, blockId)) {
    blocks[id] = toJson(document[id]);
  }
  return { rootBlockId: blockId, blocks };
}

/** Every block type a fragment uses, so a caller can check them against a registry. */
export function templateBlockTypes(template: TBlockTemplateContent): string[] {
  const types = new Set<string>();
  for (const id of collectSubtreeIds(template.blocks, template.rootBlockId)) {
    types.add(template.blocks[id].type);
  }
  return [...types];
}

/**
 * A template is JSON the host stored and handed back, so it may be anything —
 * from an older schema, or hand-written. This is the shape check the list and
 * the insert path share; the blocks themselves are the registry's business.
 */
export function isBlockTemplateContent(value: unknown): value is TBlockTemplateContent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { rootBlockId, blocks } = value as Partial<TBlockTemplateContent>;
  if (typeof rootBlockId !== 'string' || typeof blocks !== 'object' || blocks === null) {
    return false;
  }
  const root = (blocks as TEditorConfiguration)[rootBlockId];
  return typeof root?.type === 'string';
}

type TInstantiated = {
  /** The new id of the fragment's root, to be spliced into a children list. */
  blockId: string;
  /** The whole fragment under fresh ids, ready to merge into the document. */
  blocks: TEditorConfiguration;
};

/**
 * Copies a fragment under fresh ids so it can be inserted next to a copy of
 * itself. References to blocks the fragment does not carry are dropped rather
 * than left dangling — the canvas throws on a child it cannot find.
 */
export function instantiateBlockTemplate(template: TBlockTemplateContent): TInstantiated {
  const ids = collectSubtreeIds(template.blocks, template.rootBlockId);
  const idMap = new Map(ids.map((id) => [id, generateBlockId()]));

  const blocks: TEditorConfiguration = {};
  for (const id of ids) {
    const clone = toJson(template.blocks[id]);
    blocks[idMap.get(id)!] = mapBlockChildrenIds(clone, (childrenIds) =>
      childrenIds.filter((childId) => idMap.has(childId)).map((childId) => idMap.get(childId)!)
    );
  }

  return { blockId: idMap.get(template.rootBlockId)!, blocks };
}

/** How many blocks a fragment carries — shown in the list as a hint of its size. */
export function templateBlockCount(template: TBlockTemplateContent): number {
  return collectSubtreeIds(template.blocks, template.rootBlockId).length;
}
