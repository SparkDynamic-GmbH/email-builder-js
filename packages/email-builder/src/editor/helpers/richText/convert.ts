/**
 * Moving a Text block between formats reinterprets the string it already holds, so it has to be
 * rewritten to mean the same thing. Without this, switching a plain block to rich text would turn
 * a literal `a < b` into markup, and switching back would leave the tags on screen as words.
 */

export type TTextFormat = 'plain' | 'markdown' | 'html';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toRichText(text: string): string {
  return escapeHtml(text).replace(/\r?\n/g, '<br>');
}

/** Reads the marks back out as the words they wrap, which is all a plain block can hold. */
function fromRichText(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = html.replace(/<br\s*\/?>/gi, '\n');
  return root.textContent ?? '';
}

export default function convertTextFormat(text: string, from: TTextFormat, to: TTextFormat): string {
  if (from === to || text.length === 0) {
    return text;
  }
  if (to === 'html') {
    return toRichText(text);
  }
  if (from === 'html') {
    return fromRichText(text);
  }
  // plain <-> markdown: markdown source is plain text that happens to carry syntax.
  return text;
}
