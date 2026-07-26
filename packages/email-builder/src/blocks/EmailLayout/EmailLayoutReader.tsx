import React from 'react';

import { ReaderBlock } from '../../Reader/ReaderBlock';

import { EmailLayoutProps } from './EmailLayoutPropsSchema';

function getFontFamily(fontFamily: EmailLayoutProps['fontFamily']) {
  const f = fontFamily ?? 'MODERN_SANS';
  switch (f) {
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
}

function getBorder({ borderColor }: EmailLayoutProps) {
  if (!borderColor) {
    return undefined;
  }
  return `1px solid ${borderColor}`;
}

/**
 * Invisible filler appended after the preheader so a client that keeps scraping
 * text for its preview runs out of room before it reaches the first real block —
 * otherwise the inbox shows "<preheader> View in browser Shop About …".
 * Combining grapheme joiner + zero-width non-joiner + no-break space: nothing
 * renders, nothing collapses away.
 */
const PREVIEW_PADDING = '͏‌ '.repeat(60);

/**
 * Clients disagree about which of these they honour, so all of them are set:
 * `display:none` is ignored by Outlook (hence `mso-hide`) and by a handful of
 * others that do respect a zero height.
 */
const PREHEADER_STYLE = {
  display: 'none',
  maxHeight: 0,
  maxWidth: 0,
  opacity: 0,
  overflow: 'hidden',
  msoHide: 'all',
  fontSize: '1px',
  lineHeight: '1px',
  color: 'transparent',
} as React.CSSProperties;

function Preheader({ text }: { text: string }) {
  return (
    <div style={PREHEADER_STYLE}>
      {text}
      {PREVIEW_PADDING}
    </div>
  );
}

export default function EmailLayoutReader(props: EmailLayoutProps) {
  const childrenIds = props.childrenIds ?? [];
  const backdropColor = props.backdropColor ?? '#F5F5F5';
  const preheader = props.preheader?.trim();
  return (
    <>
      {preheader ? <Preheader text={preheader} /> : null}
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        border={0}
        bgcolor={backdropColor}
        style={{
          backgroundColor: backdropColor,
          minHeight: '100%',
          width: '100%',
        }}
      >
        <tbody>
          <tr>
            <td
              align="center"
              style={{
                color: props.textColor ?? '#262626',
                fontFamily: getFontFamily(props.fontFamily),
                fontSize: '16px',
                fontWeight: '400',
                letterSpacing: '0.15008px',
                lineHeight: '1.5',
                padding: '32px 0',
              }}
            >
              <table
                align="center"
                width="100%"
                style={{
                  margin: '0 auto',
                  maxWidth: '600px',
                  backgroundColor: props.canvasColor ?? '#FFFFFF',
                  borderRadius: props.borderRadius ?? undefined,
                  border: getBorder(props),
                }}
                bgcolor={props.canvasColor ?? '#FFFFFF'}
                role="presentation"
                cellSpacing="0"
                cellPadding="0"
                border={0}
              >
                <tbody>
                  <tr style={{ width: '100%' }}>
                    <td>
                      {childrenIds.map((childId) => (
                        <ReaderBlock key={childId} id={childId} />
                      ))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
