import { describe, expect, it } from '@jest/globals';

import { sanitizeRichText } from '../../../exports/blocks';

import normalizeRichText from './normalize';

describe('normalizeRichText', () => {
  it('replaces presentational tags with the semantic ones', () => {
    expect(normalizeRichText('<b>bold</b> <i>italic</i> <s>struck</s> <strike>also</strike>')).toBe(
      '<strong>bold</strong> <em>italic</em> <del>struck</del> <del>also</del>'
    );
  });

  it('keeps the marks it already stores', () => {
    expect(normalizeRichText('<strong>a</strong><em>b</em><u>c</u><del>d</del><br>e')).toBe(
      '<strong>a</strong><em>b</em><u>c</u><del>d</del><br>e'
    );
  });

  it('converts rgb colors to hex', () => {
    expect(normalizeRichText('<span style="color: rgb(255, 0, 0)">red</span>')).toBe(
      '<span style="color: #FF0000">red</span>'
    );
  });

  it('converts a font element to a styled span', () => {
    expect(normalizeRichText('<font color="rgb(0, 128, 0)">green</font>')).toBe(
      '<span style="color: #008000">green</span>'
    );
  });

  it('drops style properties it does not store', () => {
    expect(normalizeRichText('<span style="color: #FF0000; position: absolute; width: 10px">x</span>')).toBe(
      '<span style="color: #FF0000">x</span>'
    );
  });

  it('drops the font-weight span Chrome leaves on the unselected remainder', () => {
    // Stored, this span outranks any <strong> wrapped around it later, so bolding the whole
    // block would leave everything it covers unbolded.
    expect(normalizeRichText('<b>bold</b><span style="font-weight: normal">rest</span>')).toBe(
      '<strong>bold</strong>rest'
    );
  });

  it('keeps colour on a span that also carried a weight', () => {
    expect(normalizeRichText('<span style="font-weight: normal; color: #FF0000">x</span>')).toBe(
      '<span style="color: #FF0000">x</span>'
    );
  });

  it('leaves slant and decoration to the tags that mean them', () => {
    expect(normalizeRichText('<span style="font-style: italic">a</span>')).toBe('a');
    expect(normalizeRichText('<span style="text-decoration: line-through">b</span>')).toBe('b');
  });

  it('unwraps a span left with nothing to say', () => {
    expect(normalizeRichText('<span style="position: absolute">plain</span>')).toBe('plain');
    expect(normalizeRichText('<span class="whatever">plain</span>')).toBe('plain');
  });

  it('turns the divs a browser inserts per line into breaks', () => {
    expect(normalizeRichText('first<div>second</div><div>third</div>')).toBe('first<br>second<br>third');
  });

  it('does not leave a leading break when the first line is itself a div', () => {
    expect(normalizeRichText('<div>first</div><div>second</div>')).toBe('first<br>second');
  });

  it('drops disallowed elements but keeps the words inside them', () => {
    expect(normalizeRichText('<h1>heading</h1>')).toBe('heading');
    expect(normalizeRichText('a<blockquote><strong>b</strong></blockquote>')).toBe('a<br><strong>b</strong>');
  });

  it('strips attributes that are not formatting', () => {
    expect(normalizeRichText('<strong onclick="alert(1)" class="x">a</strong>')).toBe('<strong>a</strong>');
  });

  it('keeps a link and its href', () => {
    expect(normalizeRichText('<a href="https://example.com" data-x="1">link</a>')).toBe(
      '<a href="https://example.com">link</a>'
    );
  });

  it('keeps a link opened in a new tab', () => {
    expect(normalizeRichText('<a href="https://example.com" target="_blank" rel="noopener">link</a>')).toBe(
      '<a href="https://example.com" target="_blank">link</a>'
    );
  });

  it('drops a target that is not _blank', () => {
    expect(normalizeRichText('<a href="https://example.com" target="_self">link</a>')).toBe(
      '<a href="https://example.com">link</a>'
    );
  });

  it('unwraps an anchor with no address', () => {
    expect(normalizeRichText('<a>orphan</a>')).toBe('orphan');
    expect(normalizeRichText('<a href="">orphan</a>')).toBe('orphan');
  });

  it('keeps the marks inside a link', () => {
    expect(normalizeRichText('<a href="https://example.com"><b>bold</b> link</a>')).toBe(
      '<a href="https://example.com"><strong>bold</strong> link</a>'
    );
  });

  it('keeps a link’s own color and decoration, and only a link’s', () => {
    expect(
      normalizeRichText('<a href="https://example.com" style="color: rgb(255, 0, 0); text-decoration: none">x</a>')
    ).toBe('<a href="https://example.com" style="color: #FF0000; text-decoration: none">x</a>');
    // On a span the decoration is the tags' job, so it is dropped there as it always was.
    expect(normalizeRichText('<span style="color: #FF0000; text-decoration: none">x</span>')).toBe(
      '<span style="color: #FF0000">x</span>'
    );
  });

  it('removes the trailing break a browser keeps for focus', () => {
    expect(normalizeRichText('text<br>')).toBe('text');
    expect(normalizeRichText('text<br><br>')).toBe('text');
  });

  it('produces markup the block sanitizer passes through unchanged', () => {
    const normalized = normalizeRichText(
      '<b>bold</b> <font color="rgb(255, 0, 0)">red</font><div><i>next line</i></div>'
    );
    expect(normalized).toBe('<strong>bold</strong> <span style="color: #FF0000">red</span><br><em>next line</em>');
    // Nothing is dropped on the way through; insane only spells the void element differently.
    expect(sanitizeRichText(normalized)).toBe(normalized.replace('<br>', '<br/>'));
  });

  it('produces a styled link the block sanitizer passes through unchanged', () => {
    const normalized = normalizeRichText(
      '<a href="https://example.com" target="_blank" style="color: rgb(0, 0, 255); text-decoration: none">x</a>'
    );
    expect(sanitizeRichText(normalized)).toBe(normalized);
  });
});
