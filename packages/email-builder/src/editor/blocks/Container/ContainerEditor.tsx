import React from 'react';

import { ContainerProps } from '../../../blocks/Container/ContainerPropsSchema';
import { Container as BaseContainer } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useDocument, useEditorActions } from '../../EditorContext';
import EditorChildrenIds from '../../helpers/EditorChildrenIds';

export default function ContainerEditor({ style, props }: ContainerProps) {
  const { setDocument, setSelectedBlockId } = useEditorActions();
  const childrenIds = props?.childrenIds ?? [];

  const document = useDocument();
  const currentBlockId = useCurrentBlockId();

  return (
    <BaseContainer style={style}>
      <EditorChildrenIds
        childrenIds={childrenIds}
        onChange={({ blocks, blockId, childrenIds }) => {
          setDocument({
            ...blocks,
            [currentBlockId]: {
              type: 'Container',
              data: {
                ...document[currentBlockId].data,
                props: { childrenIds: childrenIds },
              },
            },
          });
          setSelectedBlockId(blockId);
        }}
      />
    </BaseContainer>
  );
}
