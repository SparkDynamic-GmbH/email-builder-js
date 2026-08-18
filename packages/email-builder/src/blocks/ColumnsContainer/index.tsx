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

const FIXED_WIDTHS_SCHEMA = z
  .tuple([z.number().nullish(), z.number().nullish(), z.number().nullish()])
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const ColumnsContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      fixedWidths: FIXED_WIDTHS_SCHEMA,
      columnsCount: z
        .union([z.literal(2), z.literal(3)])
        .optional()
        .nullable(),
      columnsGap: z.number().optional().nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
      /**
       * Let the columns fall one under another on a narrow screen. On by default,
       * because side-by-side columns in a 600px layout are unreadable on a phone —
       * but a logo beside a date is a row that reads better left alone.
       */
      stackOnMobile: z.boolean().optional().nullable(),
    })
    .optional()
    .nullable(),
});

type TColumn = React.JSX.Element | React.JSX.Element[] | null;
export type ColumnsContainerProps = z.infer<typeof ColumnsContainerPropsSchema> & {
  columns?: TColumn[];
};

const ColumnsContainerPropsDefaults = {
  columnsCount: 2,
  columnsGap: 0,
  contentAlignment: 'middle',
  stackOnMobile: true,
} as const;

/**
 * The hook the export's media query and the canvas's container query both hang
 * off. Neither rule is here, because a cell cannot be told to stack inline: the
 * whole point is a declaration that applies only below a width.
 */
const STACKING_CLASS = 'eb-column';

export function ColumnsContainer({ style, columns, props }: ColumnsContainerProps) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const cellStyle: CSSProperties = {
    backgroundColor,
    padding: getPadding(style?.padding),
  };

  const blockProps = {
    columnsCount: props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount,
    columnsGap: props?.columnsGap ?? ColumnsContainerPropsDefaults.columnsGap,
    contentAlignment: props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment,
    fixedWidths: props?.fixedWidths,
    stackOnMobile: props?.stackOnMobile ?? ColumnsContainerPropsDefaults.stackOnMobile,
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
          <td style={cellStyle}>
            <table
              role="presentation"
              align="center"
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              border={0}
              style={{ tableLayout: 'fixed', borderCollapse: 'collapse' }}
            >
              <tbody style={{ width: '100%' }}>
                <tr style={{ width: '100%' }}>
                  <TableCell index={0} props={blockProps} columns={columns} />
                  <TableCell index={1} props={blockProps} columns={columns} />
                  <TableCell index={2} props={blockProps} columns={columns} />
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

type Props = {
  props: {
    fixedWidths: z.infer<typeof FIXED_WIDTHS_SCHEMA>;
    columnsCount: 2 | 3;
    columnsGap: number;
    contentAlignment: 'top' | 'middle' | 'bottom';
    stackOnMobile: boolean;
  };
  index: number;
  columns?: TColumn[];
};
function TableCell({ index, props, columns }: Props) {
  const contentAlignment = props?.contentAlignment ?? ColumnsContainerPropsDefaults.contentAlignment;
  const columnsCount = props?.columnsCount ?? ColumnsContainerPropsDefaults.columnsCount;

  if (columnsCount === 2 && index === 2) {
    return null;
  }

  const style: CSSProperties = {
    boxSizing: 'content-box',
    verticalAlign: contentAlignment,
    paddingLeft: getPaddingBefore(index, props),
    paddingRight: getPaddingAfter(index, props),
    width: props.fixedWidths?.[index] ?? undefined,
  };
  const children = (columns && columns[index]) ?? null;
  return (
    <td className={props.stackOnMobile ? STACKING_CLASS : undefined} style={style}>
      {children}
    </td>
  );
}

function getPaddingBefore(index: number, { columnsGap, columnsCount }: Props['props']) {
  if (index === 0) {
    return 0;
  }
  if (columnsCount === 2) {
    return columnsGap / 2;
  }
  if (index === 1) {
    return columnsGap / 3;
  }
  return (2 * columnsGap) / 3;
}

function getPaddingAfter(index: number, { columnsGap, columnsCount }: Props['props']) {
  if (columnsCount === 2) {
    if (index === 0) {
      return columnsGap / 2;
    }
    return 0;
  }

  if (index === 0) {
    return (2 * columnsGap) / 3;
  }
  if (index === 1) {
    return columnsGap / 3;
  }
  return 0;
}
