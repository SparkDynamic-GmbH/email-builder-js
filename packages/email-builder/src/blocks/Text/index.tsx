import React, { CSSProperties } from 'react';
import { z } from 'zod';

import EmailMarkdown from './EmailMarkdown';
import EmailRichText from './EmailRichText';

export { RICH_TEXT_STYLE_PROPERTIES, RICH_TEXT_TAGS, sanitizeRichText } from './EmailRichText';

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
       * How `text` is to be read. The three are mutually exclusive by construction: `html` holds
       * inline marks written by the canvas toolbar, `markdown` is the GitHub-flavored source the
       * inspector's textarea takes, and `plain` is neither.
       */
      format: z.enum(['plain', 'markdown', 'html']).optional().nullable(),
      text: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type TextProps = z.infer<typeof TextPropsSchema>;

export const TextPropsDefaults = {
  text: '',
  format: 'plain' as const,
};

export function Text({ style, props }: TextProps) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const textAlign = style?.textAlign ?? undefined;
  const cellStyle: CSSProperties = {
    color: style?.color ?? undefined,
    backgroundColor,
    fontSize: style?.fontSize ?? undefined,
    fontFamily: getFontFamily(style?.fontFamily),
    fontWeight: style?.fontWeight ?? undefined,
    textAlign,
    padding: getPadding(style?.padding),
  };

  const text = props?.text ?? TextPropsDefaults.text;
  const format = props?.format ?? TextPropsDefaults.format;

  const renderCell = () => {
    switch (format) {
      case 'markdown':
        return <EmailMarkdown style={cellStyle} align={textAlign} markdown={text} />;
      case 'html':
        return <EmailRichText style={cellStyle} align={textAlign} html={text} />;
      default:
        return (
          <td align={textAlign} style={cellStyle}>
            {text}
          </td>
        );
    }
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
        <tr>{renderCell()}</tr>
      </tbody>
    </table>
  );
}
