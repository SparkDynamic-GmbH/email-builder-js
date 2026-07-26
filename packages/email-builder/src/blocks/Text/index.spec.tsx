import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react';

import { Text } from '.';

describe('block-text', () => {
  it('renders with default values', () => {
    expect(render(<Text />).asFragment()).toMatchSnapshot();
  });

  it('sanitizes HTML', () => {
    expect(
      render(
        <Text
          props={{
            format: 'markdown',
            text: `
<script>alert(1)</script>
<img src=x onerror=alert(1) />

[a](javascript:prompt(document.cookie))
[Basic](javascript:alert('Basic'))
[Local Storage](javascript:alert(JSON.stringify(localStorage)))
[CaseInsensitive](JaVaScRiPt:alert('CaseInsensitive'))
[URL](javascript://www.google.com%0Aalert('URL'))

[In Quotes]('javascript:alert("InQuotes")')
[a](j a v a s c r i p t:prompt(document.cookie))
[a](data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K)
[a](javascript:window.onerror=alert;throw%201)
![Uh oh...]("onerror="alert('XSS'))
![Uh oh...](https://www.example.com/image.png"onload="alert('XSS'))
![Escape SRC - onload](https://www.example.com/image.png"onload="alert('ImageOnLoad'))
![Escape SRC - onerror]("onerror="alert('ImageOnError'))

<div>
<img src />
<a>link 1</a>
<a href>link 2</a>
<a href="">link 3</a>
<a title>link 4</a>
<a title="">link 5</a>
<a href="ftp://domain.name">link 6</a>
<a href="javascript:alert('hello world')">link 7</a>
</div>
`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders with safe markdown', () => {
    expect(
      render(
        <Text
          props={{
            text: `This <span onClick="alert('!')">text</span> block has the **Markdown** option *turned on*.

- One
- Two
- Three

Powered by [Waypoint](https://usewaypoint.com)`,
            format: 'markdown',
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });

  it('renders rich text marks', () => {
    expect(
      render(
        <Text
          props={{
            format: 'html',
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
            format: 'html',
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

  it('renders without markdown', () => {
    expect(
      render(
        <Text
          props={{
            text: `## This is not <span>markdown</span>`,
          }}
        />
      ).asFragment()
    ).toMatchSnapshot();
  });
});
