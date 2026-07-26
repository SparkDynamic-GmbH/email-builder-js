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

export const DividerPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      lineColor: COLOR_SCHEMA,
      lineHeight: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type DividerProps = z.infer<typeof DividerPropsSchema>;

export const DividerPropsDefaults = {
  lineHeight: 1,
  lineColor: '#333333',
};

export function Divider({ style, props }: DividerProps) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const cellStyle: CSSProperties = {
    padding: getPadding(style?.padding),
    backgroundColor,
  };
  const borderTopWidth = props?.lineHeight ?? DividerPropsDefaults.lineHeight;
  const borderTopColor = props?.lineColor ?? DividerPropsDefaults.lineColor;
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
            {/* The rule is a cell's top border, not an <hr>: Outlook's Word engine renders its own
                default hr and ignores the width and colour set on it. */}
            <table
              role="presentation"
              width="100%"
              cellPadding="0"
              cellSpacing="0"
              border={0}
              style={{ width: '100%' }}
            >
              <tbody>
                <tr>
                  <td
                    style={{
                      borderTop: `${borderTopWidth}px solid ${borderTopColor}`,
                      fontSize: '1px',
                      lineHeight: '1px',
                    }}
                  >
                    &nbsp;
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
