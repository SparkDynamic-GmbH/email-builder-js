import React, { CSSProperties } from 'react';
import { z } from 'zod';

import EmailRichText from './EmailRichText';

export {
  RICH_TEXT_ANCHOR_STYLE_PROPERTIES,
  RICH_TEXT_STYLE_PROPERTIES,
  RICH_TEXT_TAGS,
  richTextStyleProperties,
  sanitizeRichText,
} from './EmailRichText';

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

export const TextPropsSchema = z.object({
  style: z
    .object({
      color: COLOR_SCHEMA,
      backgroundColor: COLOR_SCHEMA,
      /**
       * Shrink the background to the text instead of filling the block's whole width — a chip or
       * eyebrow label rather than a band. The background then needs an inset of its own, which is
       * what `backgroundPadding` is; `padding` stays the block's outer spacing either way.
       */
      inlineBackground: z.boolean().optional().nullable(),
      backgroundPadding: PADDING_SCHEMA,
      fontSize: z.number().gte(0).optional().nullable(),
      fontFamily: FONT_FAMILY_SCHEMA,
      fontWeight: z.enum(['bold', 'normal']).optional().nullable(),
      textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      /**
       * A fragment of inline HTML, written by the canvas selection toolbar and read back through
       * `sanitizeRichText`. Plain words are valid rich text, so there is no second mode — but a
       * literal `<` or `&` has to arrive escaped.
       */
      text: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type TextProps = z.infer<typeof TextPropsSchema>;

export const TextPropsDefaults = {
  text: '',
};

/**
 * Alignment goes out twice, the way background colour already does: Word honours the `align`
 * attribute and ignores `margin: auto`, and every browser-based client does the opposite —
 * `align` on a `display: table` element moves nothing outside quirks mode.
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

export function Text({ style, props }: TextProps) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const textAlign = style?.textAlign ?? undefined;
  const inlineBackground = style?.inlineBackground === true;
  const typography: CSSProperties = {
    color: style?.color ?? undefined,
    fontSize: style?.fontSize ?? undefined,
    fontFamily: getFontFamily(style?.fontFamily),
    fontWeight: style?.fontWeight ?? undefined,
    textAlign,
  };

  const text = props?.text ?? TextPropsDefaults.text;

  if (inlineBackground) {
    // A second table is what makes the background hug the text: a `display: inline-block` span
    // collapses to full width in Word, and a table is as wide as its content unless told
    // otherwise. The outer cell keeps the block's padding and places it with `align`.
    return (
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            <td style={{ padding: getPadding(style?.padding), textAlign }} align={textAlign}>
              <table
                role="presentation"
                align={textAlign}
                cellPadding="0"
                cellSpacing="0"
                border={0}
                bgcolor={backgroundColor}
                style={{ backgroundColor, ...getAlignMargin(textAlign) }}
              >
                <tbody>
                  <tr>
                    <EmailRichText
                      style={{ ...typography, padding: getPadding(style?.backgroundPadding) }}
                      align={textAlign}
                      html={text}
                    />
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    );
  }

  const cellStyle: CSSProperties = {
    color: typography.color,
    backgroundColor,
    fontSize: typography.fontSize,
    fontFamily: typography.fontFamily,
    fontWeight: typography.fontWeight,
    textAlign,
    padding: getPadding(style?.padding),
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
          <EmailRichText style={cellStyle} align={textAlign} html={text} />
        </tr>
      </tbody>
    </table>
  );
}
