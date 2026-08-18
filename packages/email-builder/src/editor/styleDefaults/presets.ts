/**
 * The presets the editor offers when the host gives it none of its own.
 *
 * Each one carries `style` only for the block types it themes: a default is
 * merged over the block definition's, so the placeholder content — a Button's
 * label, a Text block's sample sentence — stays where the definition put it and
 * only the styling comes from here.
 */
import { TBlockDefaults, TStylePreset, TStylePresetLayout } from './types';

type TPadding = { top: number; bottom: number; left: number; right: number };

type TSpec = {
  /** Padding for a block that sits in the flow of the email. */
  block: TPadding;
  /** Padding for a rule, which wants none of its own on the sides. */
  rule: TPadding;
  fontSize: number;
  /** `null` leaves each block inheriting the layout's face, which is usually right. */
  fontFamily: TStylePresetLayout['fontFamily'];
};

/**
 * Turns a spec into the per-type map. Only the types the built-in block set
 * declares appear; a host's own block is left to its definition unless the host
 * ships a preset that names it.
 */
function blockDefaults({ block, rule, fontSize, fontFamily }: TSpec): TBlockDefaults {
  const text = { padding: block, fontSize, fontFamily };
  return {
    Heading: { style: { padding: block, fontFamily } },
    Text: { style: text },
    Button: { style: text },
    Image: { style: { padding: block } },
    Card: { style: { padding: block } },
    Avatar: { style: { padding: block } },
    Divider: { style: { padding: rule } },
    Table: { style: text },
    Html: { style: text },
    ColumnsContainer: { style: { padding: block } },
    Container: { style: { padding: block } },
  };
}

export const BUILT_IN_STYLE_PRESETS: TStylePreset[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Light grey backdrop, roomy padding, modern sans.',
    layout: {
      backdropColor: '#F5F5F5',
      canvasColor: '#FFFFFF',
      borderColor: null,
      borderRadius: 0,
      textColor: '#262626',
      fontFamily: 'MODERN_SANS',
    },
    blockDefaults: blockDefaults({
      block: { top: 16, bottom: 16, left: 24, right: 24 },
      rule: { top: 16, bottom: 16, left: 0, right: 0 },
      fontSize: 16,
      fontFamily: null,
    }),
  },
  {
    id: 'compact',
    name: 'Compact',
    description: 'Tight padding and smaller type, for a dense update mail.',
    layout: {
      backdropColor: '#FFFFFF',
      canvasColor: '#FFFFFF',
      borderColor: '#E0E0E0',
      borderRadius: 0,
      textColor: '#1F1F1F',
      fontFamily: 'MODERN_SANS',
    },
    blockDefaults: blockDefaults({
      block: { top: 8, bottom: 8, left: 16, right: 16 },
      rule: { top: 8, bottom: 8, left: 0, right: 0 },
      fontSize: 14,
      fontFamily: null,
    }),
  },
  {
    id: 'editorial',
    name: 'Editorial',
    description: 'Generous whitespace and a serif face, for a long read.',
    layout: {
      backdropColor: '#FAF7F2',
      canvasColor: '#FFFFFF',
      borderColor: null,
      borderRadius: 8,
      textColor: '#1A1A1A',
      fontFamily: 'MODERN_SERIF',
    },
    blockDefaults: blockDefaults({
      block: { top: 20, bottom: 20, left: 32, right: 32 },
      rule: { top: 24, bottom: 24, left: 0, right: 0 },
      fontSize: 17,
      fontFamily: null,
    }),
  },
];
