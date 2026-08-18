/**
 * @jest-environment node
 */

import React from 'react';
import { z } from 'zod';

import { describe, expect, it } from '@jest/globals';

import { renderToStaticMarkup } from './core';
import createReader from './createReader';

/** The document shell every export carries, asserted once rather than in every case. */
const DOCTYPE = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office">';
const HEAD =
  '<head>' +
  '<meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch>' +
  '</o:OfficeDocumentSettings></xml><![endif]-->' +
  '<style>@media only screen and (max-width:600px){' +
  '.eb-column{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}' +
  '}</style>' +
  '</head>';

describe('renderToStaticMarkup', () => {
  it('renders into a string', () => {
    const result = renderToStaticMarkup(
      {
        root: {
          type: 'Container',
          data: {
            props: {
              childrenIds: [],
            },
          },
        },
      },
      { rootBlockId: 'root' }
    );
    expect(result).toEqual(
      DOCTYPE +
        HEAD +
        '<body style="margin:0;padding:0">' +
        '<table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border="0" style="width:100%">' +
        '<tbody><tr><td></td></tr></tbody></table>' +
        '</body></html>'
    );
  });
});

describe('createReader', () => {
  const noteBlocks = {
    Note: {
      schema: z.object({ text: z.string() }),
      Component: ({ text }: { text: string }) => <p>{text}</p>,
    },
  };

  it('renders a document using the block set it was created with', () => {
    const { renderToStaticMarkup } = createReader(noteBlocks);

    const result = renderToStaticMarkup({ root: { type: 'Note', data: { text: 'Hello' } } }, { rootBlockId: 'root' });
    expect(result).toEqual(DOCTYPE + HEAD + '<body style="margin:0;padding:0"><p>Hello</p></body></html>');
  });

  it('escapes nothing in the head it builds as a string', () => {
    const { renderToStaticMarkup } = createReader(noteBlocks);

    const result = renderToStaticMarkup({ root: { type: 'Note', data: { text: 'Hi' } } }, { rootBlockId: 'root' });
    // A conditional comment and a stylesheet are why the head is concatenated rather than rendered:
    // React has no comment node, and it would escape the `>` in a media query.
    expect(result).toContain('<!--[if mso]>');
    expect(result).toContain('@media only screen and (max-width:600px)');
    expect(result).not.toContain('&lt;');
  });

  it('validates documents against the block set it was created with', () => {
    const { documentSchema } = createReader(noteBlocks);

    expect(documentSchema.safeParse({ root: { type: 'Note', data: { text: 'Hello' } } }).success).toBe(true);
    expect(documentSchema.safeParse({ root: { type: 'Container', data: {} } }).success).toBe(false);
  });
});
