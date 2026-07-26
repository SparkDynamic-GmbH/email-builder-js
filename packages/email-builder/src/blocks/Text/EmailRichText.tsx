import insane, { AllowedTags } from 'insane';
import React, { CSSProperties, useMemo } from 'react';

/**
 * Inline marks only. The block renders a single `<td>`, so anything that could introduce block
 * layout, media or scripting inside it is dropped rather than escaped — a rich text run is a run
 * of formatted words, not a document.
 *
 * Strikethrough is `del` rather than `s` because that is the tag insane knows; the editor
 * normalizes the `s`/`strike` the browsers produce onto it.
 */
export const RICH_TEXT_TAGS: AllowedTags[] = ['a', 'br', 'del', 'em', 'span', 'strong', 'sub', 'sup', 'u'];

/**
 * `style` is the only attribute that carries formatting, and insane cannot look inside it, so
 * every declaration is checked here instead. `font-family` is deliberately absent: it belongs to
 * the block as a whole and the inspector owns it, and its values need quotes that
 * {@link SAFE_STYLE_VALUE} does not allow.
 */
export const RICH_TEXT_STYLE_PROPERTIES = [
  'background-color',
  'color',
  'font-size',
  'font-style',
  'font-weight',
  'text-decoration',
];

/**
 * No parentheses and no quotes, which is what it takes to write `url(...)` or a legacy CSS
 * `expression(...)`. It also rejects `rgb(...)`; the editor normalizes colors to hex before it
 * stores them, and pasted markup is reduced to plain text.
 */
const SAFE_STYLE_VALUE = /^[#a-zA-Z0-9 ,.%-]+$/;

function filterStyle(style: string): string | null {
  const declarations = style
    .split(';')
    .map((declaration) => {
      const separator = declaration.indexOf(':');
      if (separator < 0) {
        return null;
      }
      const property = declaration.slice(0, separator).trim().toLowerCase();
      const value = declaration.slice(separator + 1).trim();
      if (!RICH_TEXT_STYLE_PROPERTIES.includes(property) || !SAFE_STYLE_VALUE.test(value)) {
        return null;
      }
      return `${property}: ${value}`;
    })
    .filter((declaration): declaration is string => declaration !== null);
  return declarations.length > 0 ? declarations.join('; ') : null;
}

const GENERIC_ALLOWED_ATTRIBUTES = ['style', 'title'];

export function sanitizeRichText(html: string): string {
  return insane(html, {
    allowedTags: RICH_TEXT_TAGS,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedAttributes: {
      ...RICH_TEXT_TAGS.reduce<Record<string, string[]>>((res, tag) => {
        res[tag] = [...GENERIC_ALLOWED_ATTRIBUTES];
        return res;
      }, {}),
      a: ['href', 'target', ...GENERIC_ALLOWED_ATTRIBUTES],
    },
    // insane runs the filter *before* it applies `allowedAttributes`, so the `style` rewritten
    // here is the one it goes on to serialize. Deleting the key rather than blanking it matters:
    // insane emits a bare valueless attribute for a non-string value.
    filter: (token) => {
      const { attrs } = token;
      if (typeof attrs.style === 'string') {
        const style = filterStyle(attrs.style);
        if (style === null) {
          delete attrs.style;
        } else {
          attrs.style = style;
        }
      }
      if (token.tag === 'a' && 'href' in attrs && attrs.href === undefined) {
        attrs.href = '';
      }
      return true;
    },
  });
}

type Props = {
  style: CSSProperties;
  align?: 'left' | 'center' | 'right';
  html: string;
};

/** Renders the cell itself, so the sanitized HTML lands directly in the table Text builds. */
export default function EmailRichText({ html, ...props }: Props) {
  const data = useMemo(() => sanitizeRichText(html), [html]);
  return <td {...props} dangerouslySetInnerHTML={{ __html: data }} />;
}
