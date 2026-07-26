import { Columns3, Plus, Rows3 } from 'lucide-react';
import React, { useState } from 'react';

import { Table, TableProps, TablePropsDefaults } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions, useSelectedBlockId } from '../../EditorContext';
import InlineEditable from '../../helpers/InlineEditable';
import { useTranslate } from '../../i18n';
import Button from '../../ui/Button';

const NON_BREAKING_SPACE = ' ';

type Cell = { rowIndex: number; columnIndex: number };

/**
 * The table is edited where it is read: each cell is an `InlineEditable`, and the structural
 * controls act on the cell the caret was last in — the same model a word processor uses, and
 * the one thing that keeps row and column affordances out of the email markup itself.
 */
export default function TableEditor({ props, style }: TableProps) {
  const t = useTranslate();
  const { setDocument } = useEditorActions();
  const blockId = useCurrentBlockId();
  const isSelected = useSelectedBlockId() === blockId;
  const [activeCell, setActiveCell] = useState<Cell | null>(null);

  const rows = normalize(props?.rows ?? TablePropsDefaults.rows);
  const columnCount = rows[0]?.length ?? 0;

  const update = (nRows: string[][]) => {
    setDocument({
      [blockId]: { type: 'Table', data: { style, props: { ...props, rows: normalize(nRows) } } },
    });
  };

  const setCell = (rowIndex: number, columnIndex: number, text: string) => {
    update(rows.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === columnIndex ? text : cell)) : row)));
  };

  const addRow = () => update([...rows, Array<string>(Math.max(columnCount, 1)).fill('')]);

  const addColumn = () => update(rows.map((row) => [...row, '']));

  const deleteRow = () => {
    if (!activeCell || rows.length < 2) {
      return;
    }
    update(rows.filter((_, r) => r !== activeCell.rowIndex));
    setActiveCell(null);
  };

  const deleteColumn = () => {
    if (!activeCell || columnCount < 2) {
      return;
    }
    update(rows.map((row) => row.filter((_, c) => c !== activeCell.columnIndex)));
    setActiveCell(null);
  };

  return (
    <>
      <Table
        props={{ ...props, rows }}
        style={style}
        renderCell={({ text, rowIndex, columnIndex }) => (
          <InlineEditable value={text} onChange={(value) => setCell(rowIndex, columnIndex, value)}>
            <span onMouseDown={() => setActiveCell({ rowIndex, columnIndex })}>
              {/* An empty cell would have no height to click; the placeholder is whitespace,
                  so `InlineEditable` trims it away as soon as the cell is committed. */}
              {text === '' ? NON_BREAKING_SPACE : text}
            </span>
          </InlineEditable>
        )}
      />
      {isSelected && (
        <div
          className="flex flex-wrap items-center gap-1 border-t border-grey-300 bg-white/80 px-2 py-1"
          onClick={(ev) => ev.stopPropagation()}
        >
          <Button size="small" onClick={addRow}>
            <Plus className="size-4" />
            {t('table.addRow')}
          </Button>
          <Button size="small" onClick={addColumn}>
            <Plus className="size-4" />
            {t('table.addColumn')}
          </Button>
          <span className="flex-1" />
          <Button size="small" disabled={!activeCell || rows.length < 2} onClick={deleteRow}>
            <Rows3 className="size-4" />
            {t('table.deleteRow')}
          </Button>
          <Button size="small" disabled={!activeCell || columnCount < 2} onClick={deleteColumn}>
            <Columns3 className="size-4" />
            {t('table.deleteColumn')}
          </Button>
        </div>
      )}
    </>
  );
}

/** Makes the grid rectangular, so column operations do not have to reason about ragged rows. */
function normalize(rows: string[][]): string[][] {
  const columnCount = Math.max(1, ...rows.map((row) => row.length));
  const value = rows.length > 0 ? rows : [[]];
  return value.map((row) => (row.length === columnCount ? row : [...row, ...Array(columnCount - row.length).fill('')]));
}
