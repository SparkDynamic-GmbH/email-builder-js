import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Text } from '.';

describe('block-text', () => {
  it('renders with default values', () => {
    expect(render(<Text />).asFragment()).toMatchSnapshot();
  });

  it('renders plain words untouched', () => {
    expect(render(<Text props={{ text: 'Just some words.' }} />).asFragment()).toMatchSnapshot();
  });

  it('renders rich text marks', () => {
    expect(
      render(
        <Text
          props={{
            text:
              '<strong>Bold</strong>, <em>italic</em>, <u>underlined</u>, <del>struck</del> and ' +
              '<span style="color: #FF0000">colored</span>.<br />Second line.',
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('lets an enclosing mark win over a weight a document already carried', () => {
    // A `font-weight: normal` span inside a <strong> used to render everything it covered
    // unbolded, so bolding a whole block appeared to bold only the parts it missed.
    expect(
      render(
        <Text
          props={{
            text:
              '<strong>Start <span style="font-weight: normal">plain </span>' +
              '<u>underlined</u><span style="font-weight: normal"> end.</span></strong>',
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('shrinks the background to the text when asked, keeping padding as the outer spacing', () => {
    expect(
      render(
        <Text
          style={{
            color: '#FDFBF8',
            backgroundColor: '#8A1338',
            inlineBackground: true,
            backgroundPadding: { top: 6, bottom: 6, left: 12, right: 12 },
            fontSize: 11,
            fontWeight: 'bold',
            textAlign: 'left',
            padding: { top: 40, bottom: 0, left: 40, right: 40 },
          }}
          props={{ text: 'RELEASE 4' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('places a shrunken background with the align attribute', () => {
    expect(
      render(
        <Text
          style={{ backgroundColor: '#8A1338', inlineBackground: true, textAlign: 'center' }}
          props={{ text: 'Centered chip' }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('sanitizes rich text', () => {
    expect(
      render(
        <Text
          props={{
            text: `<script>alert(1)</script>
<img src=x onerror=alert(1) />
<div style="position: fixed">block layout</div>
<span onclick="alert(1)" style="color: #00FF00">handler dropped, color kept</span>
<span style="background-image: url(javascript:alert(1))">url dropped</span>
<span style="color: rgb(255, 0, 0)">rgb dropped</span>
<span style="COLOR: #0000FF; position: absolute">only the color survives</span>
<a href="javascript:alert('x')">link 1</a>
<a href="https://example.com">link 2</a>`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('drops the markup an untrusted document could carry', () => {
    expect(
      render(
        <Text
          props={{
            text: `<script>alert(1)</script>
<img src=x onerror=alert(1) />
<iframe src="https://evil.example"></iframe>
<a href="javascript:prompt(document.cookie)">a</a>
<a href="JaVaScRiPt:alert('CaseInsensitive')">b</a>
<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K">c</a>
<a href="ftp://domain.name">d</a>
<a href="https://example.com" onclick="alert(1)">e</a>
<style>body { display: none }</style>`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
