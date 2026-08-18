import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

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

export const EmailLayoutPropsSchema = z.object({
  backdropColor: COLOR_SCHEMA,
  borderColor: COLOR_SCHEMA,
  borderRadius: z.number().optional().nullable(),
  canvasColor: COLOR_SCHEMA,
  textColor: COLOR_SCHEMA,
  fontFamily: FONT_FAMILY_SCHEMA,
  preheader: z.string().optional().nullable(),
  childrenIds: z.array(z.string()).optional().nullable(),
  /**
   * The document's own defaults for freshly inserted blocks, keyed by block
   * type: the whole `data` a new block of that type starts from, overriding the
   * one its definition declares. Untyped here on purpose — the layout knows
   * nothing about the block set it sits in, so what is stored is checked
   * against the registry's schema at the point a block is inserted
   * (`editor/styleDefaults/`) and ignored if it does not fit.
   *
   * Nothing renders it; `EmailLayoutReader` reads the fields above and no more.
   */
  blockDefaults: z.record(z.string(), z.unknown()).optional().nullable(),
});

export type EmailLayoutProps = z.infer<typeof EmailLayoutPropsSchema>;
