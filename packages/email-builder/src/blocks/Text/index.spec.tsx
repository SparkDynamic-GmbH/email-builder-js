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
