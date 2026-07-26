import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

const FONT_FAMILY_SCHEMA = z
  .enum([
    'MODERN_SANS',
    'BOOK_SANS',
    'ORGANIC_SANS',
    'GEOMETRIC_SANS',
    'HEAVY_SANS',
    'ROUNDED_SANS',
    'MODERN_SERIF',
    'BOOK_SERIF',
    'MONOSPACE',
  ])
  .nullable()
  .optional();

function getFontFamily(fontFamily: z.infer<typeof FONT_FAMILY_SCHEMA>) {
  switch (fontFamily) {
    case 'MODERN_SANS':
      return '"Helvetica Neue", "Arial Nova", "Nimbus Sans", Arial, sans-serif';
    case 'BOOK_SANS':
      return 'Optima, Candara, "Noto Sans", source-sans-pro, sans-serif';
    case 'ORGANIC_SANS':
      return 'Seravek, "Gill Sans Nova", Ubuntu, Calibri, "DejaVu Sans", source-sans-pro, sans-serif';
    case 'GEOMETRIC_SANS':
      return 'Avenir, "Avenir Next LT Pro", Montserrat, Corbel, "URW Gothic", source-sans-pro, sans-serif';
    case 'HEAVY_SANS':
      return 'Bahnschrift, "DIN Alternate", "Franklin Gothic Medium", "Nimbus Sans Narrow", sans-serif-condensed, sans-serif';
    case 'ROUNDED_SANS':
      return 'ui-rounded, "Hiragino Maru Gothic ProN", Quicksand, Comfortaa, Manjari, "Arial Rounded MT Bold", Calibri, source-sans-pro, sans-serif';
    case 'MODERN_SERIF':
      return 'Charter, "Bitstream Charter", "Sitka Text", Cambria, serif';
    case 'BOOK_SERIF':
      return '"Iowan Old Style", "Palatino Linotype", "URW Palladio L", P052, serif';
    case 'MONOSPACE':
      return '"Nimbus Mono PS", "Courier New", "Cutive Mono", monospace';
  }
  return undefined;
}

const ALIGNMENT_SCHEMA = z.enum(['left', 'center', 'right']);

/** An empty cell collapses in Word and loses its borders, so empty cells hold this instead. */
const NON_BREAKING_SPACE = ' ';

export const TablePropsSchema = z.object({
  props: z
    .object({
      /** Row-major cell text. Rows may be ragged; short rows are padded when rendered. */
      rows: z.array(z.array(z.string())).optional().nullable(),
      /** Renders the first row as `<th>` cells with their own colors. */
      headerRow: z.boolean().optional().nullable(),
      /** Per-column text alignment, indexed by column. Missing entries fall back to left. */
      columnAlignments: z.array(ALIGNMENT_SCHEMA).optional().nullable(),
      headerBackgroundColor: COLOR_SCHEMA,
      headerTextColor: COLOR_SCHEMA,
      /** Background for every other body row. Null turns striping off. */
      stripedRowColor: COLOR_SCHEMA,
      borderColor: COLOR_SCHEMA,
      borderWidth: z.number().optional().nullable(),
      cellPadding: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  style: z
    .object({
      color: COLOR_SCHEMA,
      backgroundColor: COLOR_SCHEMA,
      fontFamily: FONT_FAMILY_SCHEMA,
      fontSize: z.number().min(0).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type TableProps = z.infer<typeof TablePropsSchema>;

export const TablePropsDefaults = {
  rows: [['', '']] as string[][],
  headerRow: true,
  headerBackgroundColor: '#F2F2F2',
  borderColor: '#CCCCCC',
  borderWidth: 1,
  cellPadding: 8,
  fontSize: 14,
} as const;

/**
 * Lets the canvas variant put an editing surface inside each cell while the cell markup,
 * and therefore what the email actually looks like, stays defined in one place.
 */
export type TableCellRenderer = (args: {
  text: string;
  rowIndex: number;
  columnIndex: number;
  isHeader: boolean;
}) => React.ReactNode;

type Props = TableProps & {
  renderCell?: TableCellRenderer;
};

export function Table({ props, style, renderCell }: Props) {
  const rows = props?.rows ?? TablePropsDefaults.rows;
  const headerRow = props?.headerRow ?? TablePropsDefaults.headerRow;
  const columnCount = getColumnCount(rows);

  const borderWidth = props?.borderWidth ?? TablePropsDefaults.borderWidth;
  const borderColor = props?.borderColor ?? TablePropsDefaults.borderColor;
  const cellPadding = props?.cellPadding ?? TablePropsDefaults.cellPadding;
  const stripedRowColor = props?.stripedRowColor ?? undefined;
  const headerBackgroundColor = props?.headerBackgroundColor ?? undefined;
  const headerTextColor = props?.headerTextColor ?? undefined;

  const backgroundColor = style?.backgroundColor ?? undefined;
  const color = style?.color ?? undefined;
  const fontFamily = getFontFamily(style?.fontFamily);
  const fontSize = style?.fontSize ?? TablePropsDefaults.fontSize;

  const baseCellStyle: CSSProperties = {
    padding: `${cellPadding}px`,
    border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
    color,
    fontFamily,
    fontSize: `${fontSize}px`,
    // Word inherits nothing reliably from the table, so every cell carries its own metrics.
    lineHeight: 1.5,
    verticalAlign: 'top',
  };

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      bgcolor={backgroundColor}
      style={{ width: '100%' }}
    >
      <tbody>
        <tr>
          {/* The padding lives on the cell — Word ignores it on a div. */}
          <td style={{ padding: getPadding(style?.padding), backgroundColor }}>
            <table
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              border={0}
              style={{ width: '100%', borderCollapse: 'collapse' }}
            >
              <tbody>
                {rows.map((row, rowIndex) => {
                  const isHeader = headerRow && rowIndex === 0;
                  const bodyIndex = headerRow ? rowIndex - 1 : rowIndex;
                  const rowBackgroundColor = isHeader
                    ? headerBackgroundColor
                    : bodyIndex % 2 === 1
                      ? stripedRowColor
                      : undefined;
                  // The row background is carried by the cells: `bgcolor` on a `tr` is dropped
                  // by several clients, and Word only reads it on the cell.
                  return (
                    <tr key={rowIndex}>
                      {padRow(row, columnCount).map((text, columnIndex) => {
                        const textAlign = props?.columnAlignments?.[columnIndex] ?? 'left';
                        const cellStyle: CSSProperties = {
                          ...baseCellStyle,
                          textAlign,
                          backgroundColor: rowBackgroundColor,
                          color: isHeader ? headerTextColor ?? color : color,
                          fontWeight: isHeader ? 'bold' : 'normal',
                        };
                        const content = renderCell
                          ? renderCell({ text, rowIndex, columnIndex, isHeader })
                          : text || NON_BREAKING_SPACE;
                        const cellProps = {
                          align: textAlign,
                          bgcolor: rowBackgroundColor,
                          style: cellStyle,
                          children: content,
                        };
                        return isHeader ? (
                          <th key={columnIndex} scope="col" {...cellProps} />
                        ) : (
                          <td key={columnIndex} {...cellProps} />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

function getColumnCount(rows: string[][]) {
  return rows.reduce((max, row) => Math.max(max, row.length), 0);
}

function padRow(row: string[], columnCount: number) {
  if (row.length >= columnCount) {
    return row;
  }
  return [...row, ...Array<string>(columnCount - row.length).fill('')];
}
