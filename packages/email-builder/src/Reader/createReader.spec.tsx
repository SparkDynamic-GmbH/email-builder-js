/**
 * @jest-environment node
 */

import React from 'react';
import { z } from 'zod';

import { describe, expect, it } from '@jest/globals';

import { renderToStaticMarkup } from './core';
import createReader from './createReader';

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
    // React 19 always emits a <head> for a rendered <html>, even an empty one.
    expect(result).toEqual('<!DOCTYPE html><html><head></head><body><div></div></body></html>');
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
    expect(result).toEqual('<!DOCTYPE html><html><head></head><body><p>Hello</p></body></html>');
  });

  it('validates documents against the block set it was created with', () => {
    const { documentSchema } = createReader(noteBlocks);

    expect(documentSchema.safeParse({ root: { type: 'Note', data: { text: 'Hello' } } }).success).toBe(true);
    expect(documentSchema.safeParse({ root: { type: 'Container', data: {} } }).success).toBe(false);
  });
});
