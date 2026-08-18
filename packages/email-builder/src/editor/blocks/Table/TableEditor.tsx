import { Columns3, Plus, Rows3 } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { Table, TableProps, TablePropsDefaults } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions, useSelectedBlockId } from '../../EditorContext';
import InlineEditable from '../../helpers/InlineEditable';
import { useTranslate } from '../../i18n';
import Button from '../../ui/Button';

const NON_BREAKING_SPACE = ' ';

/** A column can be dragged down to this share of the table, never past it. */
const MIN_COLUMN_SHARE = 0.05;

type Cell = { rowIndex: number; columnIndex: number };

type Drag = {
  boundaryIndex: number;
  startX: number;
  startWidths: number[];
  tableWidth: number;
  /** A click that never moved leaves the table on auto layout rather than pinning it. */
  moved: boolean;
};

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
  // Live widths during a drag. Nothing is written to the store until the pointer is released.
  const [dragWidths, setDragWidths] = useState<number[] | null>(null);
  const drag = useRef<Drag | null>(null);

  const rows = normalize(props?.rows ?? TablePropsDefaults.rows);
  const columnCount = rows[0]?.length ?? 0;
  const storedWidths = props?.columnWidths?.length === columnCount ? props.columnWidths : undefined;
  const columnWidths = dragWidths ?? storedWidths;

  const cellPadding = props?.cellPadding ?? TablePropsDefaults.cellPadding;
  const borderWidth = props?.borderWidth ?? TablePropsDefaults.borderWidth;

  const update = (next: Partial<NonNullable<TableProps['props']>>) => {
    setDocument({ [blockId]: { type: 'Table', data: { style, props: { ...props, ...next } } } });
  };

  const updateRows = (nRows: string[][], widths?: number[]) =>
    update({ rows: normalize(nRows), ...(widths ? { columnWidths: widths } : {}) });

  const setCell = (rowIndex: number, columnIndex: number, text: string) => {
    updateRows(rows.map((row, r) => (r === rowIndex ? row.map((cell, c) => (c === columnIndex ? text : cell)) : row)));
  };

  const addRow = () => updateRows([...rows, Array<string>(Math.max(columnCount, 1)).fill('')]);

  // Column widths are shares, so a new column takes the average of the existing ones and the
  // rest keep their proportions to each other.
  const addColumn = () => {
    const widths = storedWidths
      ? [...storedWidths, storedWidths.reduce((sum, w) => sum + w, 0) / storedWidths.length]
      : undefined;
    updateRows(
      rows.map((row) => [...row, '']),
      widths
    );
  };

  const deleteRow = () => {
    if (!activeCell || rows.length < 2) {
      return;
    }
    updateRows(rows.filter((_, r) => r !== activeCell.rowIndex));
    setActiveCell(null);
  };

  const deleteColumn = () => {
    if (!activeCell || columnCount < 2) {
      return;
    }
    const { columnIndex } = activeCell;
    updateRows(
      rows.map((row) => row.filter((_, c) => c !== columnIndex)),
      storedWidths?.filter((_, c) => c !== columnIndex)
    );
    setActiveCell(null);
  };

  /**
   * Starts from the widths the columns actually have on screen when none are stored yet, so the
   * first drag adjusts the one boundary it was given rather than snapping the table to equal
   * columns underneath the pointer.
   */
  const startDrag = (boundaryIndex: number, ev: React.PointerEvent<HTMLSpanElement>) => {
    const cells = ev.currentTarget.closest('table')?.rows[0]?.cells;
    if (!cells) {
      return;
    }
    const measured = Array.from(cells, (cell) => cell.getBoundingClientRect().width);
    const startWidths = storedWidths ?? measured;
    const tableWidth = measured.reduce((sum, width) => sum + width, 0);
    if (tableWidth <= 0 || startWidths.length !== columnCount) {
      return;
    }
    ev.preventDefault();
    ev.stopPropagation();
    ev.currentTarget.setPointerCapture(ev.pointerId);
    drag.current = { boundaryIndex, startX: ev.clientX, startWidths, tableWidth, moved: false };
    setDragWidths(startWidths);
  };

  const moveDrag = (ev: React.PointerEvent<HTMLSpanElement>) => {
    const current = drag.current;
    if (!current) {
      return;
    }
    const { boundaryIndex, startX, startWidths, tableWidth } = current;
    const total = startWidths.reduce((sum, width) => sum + width, 0);
    const pair = startWidths[boundaryIndex] + startWidths[boundaryIndex + 1];
    const minimum = total * MIN_COLUMN_SHARE;
    const delta = ((ev.clientX - startX) / tableWidth) * total;
    // Only the dragged pair moves, and neither half of it can be squeezed out of existence.
    const left = Math.min(Math.max(startWidths[boundaryIndex] + delta, minimum), pair - minimum);
    const next = [...startWidths];
    next[boundaryIndex] = left;
    next[boundaryIndex + 1] = pair - left;
    current.moved = true;
    setDragWidths(next);
  };

  const endDrag = () => {
    const current = drag.current;
    if (!current) {
      return;
    }
    drag.current = null;
    if (current.moved && dragWidths) {
      update({ columnWidths: dragWidths });
    }
    setDragWidths(null);
  };

  return (
    <>
      <Table
        props={{ ...props, rows, columnWidths }}
        style={style}
        renderCell={({ text, rowIndex, columnIndex }) => (
          <div className="relative">
            <InlineEditable value={text} onChange={(value) => setCell(rowIndex, columnIndex, value)}>
              <span onMouseDown={() => setActiveCell({ rowIndex, columnIndex })}>
                {/* An empty cell would have no height to click; the placeholder is whitespace,
                    so `InlineEditable` trims it away as soon as the cell is committed. */}
                {text === '' ? NON_BREAKING_SPACE : text}
              </span>
            </InlineEditable>
            {isSelected && columnIndex < columnCount - 1 && (
              <span
                role="separator"
                aria-orientation="vertical"
                aria-label={t('table.resizeColumn')}
                // The handle sits outside the editable region and straddles the cell border,
                // which the padding and border widths put just past the content box.
                style={{
                  position: 'absolute',
                  top: -cellPadding,
                  bottom: -cellPadding,
                  right: -(cellPadding + borderWidth / 2 + 4),
                  width: 8,
                  touchAction: 'none',
                }}
                className="cursor-col-resize hover:bg-brand-blue/30"
                onPointerDown={(ev) => startDrag(columnIndex, ev)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
            )}
          </div>
        )}
      />
      {isSelected && (
        <div
          className="eb-chrome flex flex-wrap items-center gap-1 border-t border-grey-300 bg-white/80 px-2 py-1"
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
