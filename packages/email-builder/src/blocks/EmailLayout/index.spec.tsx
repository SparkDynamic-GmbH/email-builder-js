/**
 * Rendered as a string rather than into jsdom, the way the other block specs
 * do: jsdom parses styles through CSSOM and silently drops `mso-hide`, which
 * is precisely the declaration the preheader depends on in Outlook.
 *
 * @jest-environment node
 */

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { describe, expect, it } from '@jest/globals';

import EmailLayoutReader from './EmailLayoutReader';

describe('block-email-layout', () => {
  it('renders with default values', () => {
    expect(renderToStaticMarkup(<EmailLayoutReader />)).toMatchSnapshot();
  });

  it('renders the preheader as hidden text ahead of the layout table', () => {
    expect(renderToStaticMarkup(<EmailLayoutReader preheader="Your order shipped" />)).toMatchSnapshot();
  });

  it('emits nothing for a blank preheader', () => {
    expect(renderToStaticMarkup(<EmailLayoutReader preheader="   " />)).not.toContain('<div');
  });
});
