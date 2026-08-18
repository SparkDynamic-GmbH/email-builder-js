import React, { Fragment } from 'react';

import EditorBlock from '../../../editor/EditorBlock';
import { TEditorConfiguration } from '../../../editor/types';

import AddBlockButton, { TBlockInsertion } from './AddBlockMenu';

export type EditorChildrenChange = {
  /** The inserted block's id — the fragment's root, when a template was chosen. */
  blockId: string;
  /**
   * The inserted block and, for a template, everything under it, keyed by id.
   * Merge the lot into the document: for a plain block it is a single entry.
   */
  blocks: TEditorConfiguration;
  childrenIds: string[];
};

export type EditorChildrenIdsProps = {
  childrenIds: string[] | null | undefined;
  onChange: (val: EditorChildrenChange) => void;
};
export default function EditorChildrenIds({ childrenIds, onChange }: EditorChildrenIdsProps) {
  const insertBlock = ({ blockId, blocks }: TBlockInsertion, index: number) => {
    const newChildrenIds = [...(childrenIds || [])];
    newChildrenIds.splice(index, 0, blockId);
    return onChange({ blockId, blocks, childrenIds: newChildrenIds });
  };

  const appendBlock = (insertion: TBlockInsertion) => insertBlock(insertion, (childrenIds || []).length);

  if (!childrenIds || childrenIds.length === 0) {
    return <AddBlockButton placeholder onSelect={appendBlock} />;
  }

  return (
    <>
      {childrenIds.map((childId, i) => (
        <Fragment key={childId}>
          <AddBlockButton onSelect={(insertion) => insertBlock(insertion, i)} />
          <EditorBlock id={childId} />
        </Fragment>
      ))}
      <AddBlockButton onSelect={appendBlock} />
    </>
  );
}
