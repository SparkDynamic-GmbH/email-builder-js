import { describe, expect, it } from '@jest/globals';

import convertTextFormat from './convert';

describe('convertTextFormat', () => {
  it('escapes plain text on the way into rich text', () => {
    expect(convertTextFormat('a < b & c', 'plain', 'html')).toBe('a &lt; b &amp; c');
  });

  it('carries line breaks across', () => {
    expect(convertTextFormat('one\ntwo', 'plain', 'html')).toBe('one<br>two');
    expect(convertTextFormat('one<br>two', 'html', 'plain')).toBe('one\ntwo');
  });

  it('reads rich text back as the words it wraps', () => {
    expect(convertTextFormat('<strong>bold</strong> and <em>italic</em>', 'html', 'plain')).toBe('bold and italic');
  });

  it('round-trips text that looks like markup', () => {
    const original = 'a < b & c';
    expect(convertTextFormat(convertTextFormat(original, 'plain', 'html'), 'html', 'plain')).toBe(original);
  });

  it('leaves markdown source alone', () => {
    expect(convertTextFormat('**bold**', 'plain', 'markdown')).toBe('**bold**');
  });
});
