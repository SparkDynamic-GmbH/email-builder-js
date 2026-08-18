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
      /** The rule's own width in px. Null is the full width of the block. */
      lineWidth: z.number().gte(1).optional().nullable(),
      /** Where a rule narrower than the block sits. Ignored at full width. */
      align: z.enum(['left', 'center', 'right']).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type DividerProps = z.infer<typeof DividerPropsSchema>;

/**
 * Alignment goes out twice, the way background colour and text alignment already do: Word honours
 * the `align` attribute and ignores `margin: auto`, and every browser-based client does the
 * opposite — `align` on a `display: table` element moves nothing outside quirks mode.
 */
function getAlignMargin(align: 'left' | 'center' | 'right' | undefined): CSSProperties {
  switch (align) {
    case 'center':
      return { marginLeft: 'auto', marginRight: 'auto' };
    case 'right':
      return { marginLeft: 'auto' };
    default:
      return {};
  }
}

export const DividerPropsDefaults = {
  lineHeight: 1,
  lineColor: '#333333',
  lineWidth: null,
  align: 'left',
} as const;

export function Divider({ style, props }: DividerProps) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const cellStyle: CSSProperties = {
    padding: getPadding(style?.padding),
    backgroundColor,
  };
  const borderTopWidth = props?.lineHeight ?? DividerPropsDefaults.lineHeight;
  const borderTopColor = props?.lineColor ?? DividerPropsDefaults.lineColor;
  // A rule narrower than the block is a table of that width rather than a margin: Word ignores
  // `margin: auto` and honours the `align` attribute, so the attribute is what positions it.
  const lineWidth = props?.lineWidth ?? DividerPropsDefaults.lineWidth;
  const align = lineWidth === null ? undefined : props?.align ?? undefined;
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
              width={lineWidth ?? '100%'}
              align={align}
              cellPadding="0"
              cellSpacing="0"
              border={0}
              style={{ width: lineWidth ?? '100%', ...getAlignMargin(align) }}
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
