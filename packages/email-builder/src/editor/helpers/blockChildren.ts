/**
 * The one place that knows which blocks hold children and where. Everything
 * that walks or rewrites the tree — the template library, and `TuneMenu`'s
 * parent lookup — goes through here rather than repeating the container switch.
 *
 * A host's own container is invisible to this: it reads as a leaf, so its
 * children are neither collected into a template nor renumbered on insert.
 */
import { TEditorBlock, TEditorConfiguration } from '../types';

type TColumn = { childrenIds: string[] };

/** Fresh enough to not collide inside one insert, or across two of them. */
let counter = 0;
export function generateBlockId(): string {
  counter += 1;
  return `block-${Date.now()}-${counter}-${Math.floor(Math.random() * 1000)}`;
}

/** Every child id a block holds, across all of its slots, in render order. */
export function blockChildrenIds(block: TEditorBlock): string[] {
  switch (block.type) {
    case 'EmailLayout':
      return block.data?.childrenIds ?? [];
    case 'Container':
    case 'Card':
      return block.data?.props?.childrenIds ?? [];
    case 'ColumnsContainer':
      return (block.data?.props?.columns ?? []).flatMap((column: TColumn) => column.childrenIds ?? []);
    default:
      return [];
  }
}

/**
 * Rewrites every children list a block holds. Immutable — the block and the
 * arrays it came with are left alone, since the previous document is sitting on
 * the undo stack.
 */
export function mapBlockChildrenIds(block: TEditorBlock, map: (childrenIds: string[]) => string[]): TEditorBlock {
  switch (block.type) {
    case 'EmailLayout':
      return { ...block, data: { ...block.data, childrenIds: map(block.data?.childrenIds ?? []) } };
    case 'Container':
    case 'Card':
      return {
        ...block,
        data: {
          ...block.data,
          props: { ...block.data?.props, childrenIds: map(block.data?.props?.childrenIds ?? []) },
        },
      };
    case 'ColumnsContainer': {
      const columns = block.data?.props?.columns;
      if (!columns) {
        return block;
      }
      return {
        ...block,
        data: {
          ...block.data,
          props: {
            ...block.data.props,
            columns: columns.map((column: TColumn) => ({ ...column, childrenIds: map(column.childrenIds ?? []) })),
          },
        },
      };
    }
    default:
      return block;
  }
}

/** Which block holds `blockId` as a child, or null for a root or an orphan. */
export function findParentBlockId(blockId: string, document: TEditorConfiguration): string | null {
  for (const [id, block] of Object.entries(document)) {
    if (id !== blockId && blockChildrenIds(block).includes(blockId)) {
      return id;
    }
  }
  return null;
}

/**
 * Where the canvas starts. `'root'` by convention, as `StylesPanel` assumes;
 * the EmailLayout search is the fallback for a document keyed some other way.
 */
export function findRootBlockId(document: TEditorConfiguration): string | null {
  if (document.root) {
    return 'root';
  }
  const layout = Object.entries(document).find(([, block]) => block.type === 'EmailLayout');
  return layout?.[0] ?? null;
}

/** `blockId` and everything under it, parents before children, no duplicates. */
export function collectSubtreeIds(document: TEditorConfiguration, blockId: string): string[] {
  const ids: string[] = [];
  const visit = (id: string) => {
    if (ids.includes(id) || !document[id]) {
      return;
    }
    ids.push(id);
    blockChildrenIds(document[id]).forEach(visit);
  };
  visit(blockId);
  return ids;
}

/**
 * A patch putting `newIds` right after `targetId` in whichever list holds it —
 * one entry, the rewritten parent, ready for `setDocument`. Null when nothing
 * holds it, and the caller has to pick a container itself.
 */
export function insertAfterBlock(
  document: TEditorConfiguration,
  targetId: string,
  newIds: string[]
): TEditorConfiguration | null {
  const parentId = findParentBlockId(targetId, document);
  if (parentId === null) {
    return null;
  }
  const parent = mapBlockChildrenIds(document[parentId], (childrenIds) => {
    const index = childrenIds.indexOf(targetId);
    if (index < 0) {
      return childrenIds;
    }
    const next = [...childrenIds];
    next.splice(index + 1, 0, ...newIds);
    return next;
  });
  return { [parentId]: parent };
}

/**
 * A patch appending `newIds` to a container's children. ColumnsContainer holds
 * three lists and would take them into every column, so it is not a valid
 * target here.
 */
export function appendToBlock(
  document: TEditorConfiguration,
  parentId: string,
  newIds: string[]
): TEditorConfiguration | null {
  const parent = document[parentId];
  if (!parent || parent.type === 'ColumnsContainer') {
    return null;
  }
  return { [parentId]: mapBlockChildrenIds(parent, (childrenIds) => [...childrenIds, ...newIds]) };
}
