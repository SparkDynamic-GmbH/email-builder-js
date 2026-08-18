import { useDocument, useEditorActions, useEditorRegistry, useSelectedBlockId } from '../EditorContext';
import { appendToBlock, findRootBlockId, insertAfterBlock } from '../helpers/blockChildren';

import { instantiateBlockTemplate, templateBlockTypes } from './helpers';
import { TBlockTemplateContent } from './types';

/**
 * Whether every block a template carries is one this editor knows. A library is
 * the host's JSON, possibly written against a registry that had a block this
 * one does not — inserting that would throw on the canvas, so the list offers
 * it as unavailable instead.
 */
export function useIsTemplateSupported() {
  const { editorDictionary } = useEditorRegistry();
  return (template: TBlockTemplateContent) => templateBlockTypes(template).every((type) => type in editorDictionary);
}

/**
 * Inserts a template into the document under fresh ids and selects its root.
 *
 * Placement is the obvious one: after the selected block, or at the end of the
 * document when nothing is selected — the same place a block added from the
 * bottom of the canvas would land. The add-block menu does not use this; it
 * knows its own insertion point and splices there.
 *
 * Returns the new root block's id, or null when there was nowhere to put it.
 */
export default function useInsertBlockTemplate() {
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();
  const { setDocument, setSelectedBlockId } = useEditorActions();

  return (template: TBlockTemplateContent): string | null => {
    const { blockId, blocks } = instantiateBlockTemplate(template);

    const rootBlockId = findRootBlockId(document);
    const patch =
      (selectedBlockId === null ? null : insertAfterBlock(document, selectedBlockId, [blockId])) ??
      (rootBlockId === null ? null : appendToBlock(document, rootBlockId, [blockId]));

    if (patch === null) {
      return null;
    }

    setDocument({ ...blocks, ...patch });
    setSelectedBlockId(blockId);
    return blockId;
  };
}
