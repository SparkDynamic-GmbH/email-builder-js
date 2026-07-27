import { ArrowDown, ArrowUp, Copy, Trash2 } from 'lucide-react';
import React from 'react';

import { ColumnsContainerProps } from '../../../blocks/ColumnsContainer/ColumnsContainerPropsSchema';
import { useDocument, useEditorActions } from '../../../editor/EditorContext';
import { TEditorBlock, TEditorConfiguration } from '../../../editor/types';
import { useTranslate } from '../../i18n';
import IconButton from '../../ui/IconButton';
import Tooltip from '../../ui/Tooltip';
import cloneDocumentBlock from '../cloneDocumentBlock';

type TColumn = { childrenIds: string[] };

function findParentBlockId(blockId: string, document: TEditorConfiguration) {
  for (const [id, b] of Object.entries(document)) {
    if (id === blockId) {
      continue;
    }
    const block = b as TEditorBlock;
    switch (block.type) {
      case 'EmailLayout':
        if (block.data.childrenIds?.includes(blockId)) {
          return id;
        }
        break;
      case 'Container':
      case 'Card':
        if (block.data.props?.childrenIds?.includes(blockId)) {
          return id;
        }
        break;
      case 'ColumnsContainer':
        if (block.data.props?.columns?.some((col: TColumn) => col.childrenIds?.includes(blockId))) {
          return id;
        }
        break;
    }
  }
  return null;
}

type Props = {
  blockId: string;
};
export default function TuneMenu({ blockId }: Props) {
  const t = useTranslate();
  const { resetDocument, setSelectedBlockId } = useEditorActions();
  const document = useDocument();

  const handleDuplicateClick = () => {
    const parentBlockId = findParentBlockId(blockId, document);

    const { document: newDocument, blockId: newBlockId } = cloneDocumentBlock(document, blockId);

    if (parentBlockId) {
      const parentBlock = newDocument[parentBlockId];
      switch (parentBlock.type) {
        case 'EmailLayout': {
          if (!parentBlock.data.childrenIds) {
            parentBlock.data.childrenIds = [];
          }
          const index = parentBlock.data.childrenIds.indexOf(blockId);
          parentBlock.data.childrenIds.splice(index + 1, 0, newBlockId);
          break;
        }
        case 'Container':
        case 'Card': {
          if (!parentBlock.data.props) {
            parentBlock.data.props = {};
          }
          if (!parentBlock.data.props.childrenIds) {
            parentBlock.data.props.childrenIds = [];
          }
          const index = parentBlock.data.props.childrenIds.indexOf(blockId);
          parentBlock.data.props.childrenIds.splice(index + 1, 0, newBlockId);
          break;
        }
        case 'ColumnsContainer':
          if (!parentBlock.data.props) {
            parentBlock.data.props = { columns: [{ childrenIds: [] }, { childrenIds: [] }, { childrenIds: [] }] };
          }

          for (const column of parentBlock.data.props.columns) {
            if (column.childrenIds.includes(blockId)) {
              const index = column.childrenIds.indexOf(blockId);
              column.childrenIds.splice(index + 1, 0, newBlockId);
            }
          }
          break;
      }

      resetDocument(newDocument);
      setSelectedBlockId(newBlockId);
    }
  };

  const handleDeleteClick = () => {
    const filterChildrenIds = (childrenIds: string[] | null | undefined) => {
      if (!childrenIds) {
        return childrenIds;
      }
      return childrenIds.filter((f) => f !== blockId);
    };
    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }

      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: filterChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
        case 'Card':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: filterChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c: TColumn) => ({
                  childrenIds: filterChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }
    delete nDocument[blockId];
    resetDocument(nDocument);
  };

  const handleMoveClick = (direction: 'up' | 'down') => {
    const moveChildrenIds = (ids: string[] | null | undefined) => {
      if (!ids) {
        return ids;
      }
      const index = ids.indexOf(blockId);
      if (index < 0) {
        return ids;
      }

      const childrenIds = [...ids];
      if (direction === 'up' && index > 0) {
        [childrenIds[index], childrenIds[index - 1]] = [childrenIds[index - 1], childrenIds[index]];
      } else if (direction === 'down' && index < childrenIds.length - 1) {
        [childrenIds[index], childrenIds[index + 1]] = [childrenIds[index + 1], childrenIds[index]];
      }
      return childrenIds;
    };

    const nDocument: typeof document = { ...document };
    for (const [id, b] of Object.entries(nDocument)) {
      const block = b as TEditorBlock;
      if (id === blockId) {
        continue;
      }

      switch (block.type) {
        case 'EmailLayout':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              childrenIds: moveChildrenIds(block.data.childrenIds),
            },
          };
          break;
        case 'Container':
        case 'Card':
          nDocument[id] = {
            ...block,
            data: {
              ...block.data,
              props: {
                ...block.data.props,
                childrenIds: moveChildrenIds(block.data.props?.childrenIds),
              },
            },
          };
          break;
        case 'ColumnsContainer':
          nDocument[id] = {
            type: 'ColumnsContainer',
            data: {
              style: block.data.style,
              props: {
                ...block.data.props,
                columns: block.data.props?.columns?.map((c: TColumn) => ({
                  childrenIds: moveChildrenIds(c.childrenIds),
                })),
              },
            } as ColumnsContainerProps,
          };
          break;
        default:
          nDocument[id] = block;
      }
    }

    resetDocument(nDocument);
    setSelectedBlockId(blockId);
  };

  return (
    <div
      className="absolute top-0 -left-14 z-40 flex flex-col rounded-full bg-white px-1 py-2 shadow-e2"
      onClick={(ev) => ev.stopPropagation()}
    >
      <Tooltip title={t('canvas.moveUp')} side="left" align="start">
        <IconButton onClick={() => handleMoveClick('up')} aria-label={t('canvas.moveUp')}>
          <ArrowUp className="size-5" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('canvas.moveDown')} side="left" align="start">
        <IconButton onClick={() => handleMoveClick('down')} aria-label={t('canvas.moveDown')}>
          <ArrowDown className="size-5" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('canvas.duplicate')} side="left" align="start">
        <IconButton onClick={handleDuplicateClick} aria-label={t('canvas.duplicate')}>
          <Copy className="size-5" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('canvas.delete')} side="left" align="start">
        <IconButton onClick={handleDeleteClick} aria-label={t('canvas.delete')}>
          <Trash2 className="size-5" />
        </IconButton>
      </Tooltip>
    </div>
  );
}
