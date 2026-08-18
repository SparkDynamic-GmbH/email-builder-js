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

const BORDER_WIDTH_SCHEMA = z
  .object({
    top: z.number().gte(0),
    bottom: z.number().gte(0),
    right: z.number().gte(0),
    left: z.number().gte(0),
  })
  .optional()
  .nullable();

export const ContainerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      borderColor: COLOR_SCHEMA,
      /**
       * Per-side widths for the border `borderColor` draws. Absent means the uniform 1px this
       * block has always drawn, so a document written before this existed renders unchanged;
       * a side set to 0 drops that edge, which is how a single accent rule is built.
       */
      borderWidth: BORDER_WIDTH_SCHEMA,
      borderRadius: z.number().optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type ContainerProps = {
  style?: z.infer<typeof ContainerPropsSchema>['style'];
  children?: React.JSX.Element | React.JSX.Element[] | null;
};

function getBorder(style: ContainerProps['style']): CSSProperties {
  const color = style?.borderColor;
  if (!color) {
    return {};
  }
  const width = style?.borderWidth;
  if (!width) {
    return { border: `1px solid ${color}` };
  }
  // Only the sides that have a width are declared: a `0px solid` edge is noise in the output, and
  // Word is happier with the three properties it needs than with four it has to cancel.
  return {
    ...(width.top > 0 ? { borderTop: `${width.top}px solid ${color}` } : null),
    ...(width.right > 0 ? { borderRight: `${width.right}px solid ${color}` } : null),
    ...(width.bottom > 0 ? { borderBottom: `${width.bottom}px solid ${color}` } : null),
    ...(width.left > 0 ? { borderLeft: `${width.left}px solid ${color}` } : null),
  };
}

export function Container({ style, children }: ContainerProps) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const tStyle: CSSProperties = {
    width: '100%',
    backgroundColor,
    ...getBorder(style),
    borderRadius: style?.borderRadius ?? undefined,
  };
  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      bgcolor={backgroundColor}
      style={tStyle}
    >
      <tbody>
        <tr>
          <td style={{ padding: getPadding(style?.padding) }}>{children}</td>
        </tr>
      </tbody>
    </table>
  );
}
