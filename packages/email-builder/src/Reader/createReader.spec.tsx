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
    // A conditional comment is why the head is concatenated rather than rendered: React has no
    // comment node to emit one with.
    expect(result).toContain('<!--[if mso]>');
    expect(result).not.toContain('&lt;');
  });

  it('validates documents against the block set it was created with', () => {
    const { documentSchema } = createReader(noteBlocks);

    expect(documentSchema.safeParse({ root: { type: 'Note', data: { text: 'Hello' } } }).success).toBe(true);
    expect(documentSchema.safeParse({ root: { type: 'Container', data: {} } }).success).toBe(false);
  });
});
