import { RICH_TEXT_STYLE_PROPERTIES, RICH_TEXT_TAGS } from '../../../exports/blocks';

/**
 * `execCommand` output is browser-dependent — Chrome writes `<b>` and wraps each new line in a
 * `<div>`, Firefox prefers `<span style>` and `<br>`, and colors come back as `rgb(...)`. This
 * reshapes all of it into the small inline vocabulary the block's sanitizer accepts, so what is
 * stored is the same regardless of where it was typed.
 *
 * It is not a security boundary. `sanitizeRichText` is, and it runs again at render time.
 */

const ALLOWED_TAGS = new Set<string>(RICH_TEXT_TAGS);

/** Presentational tags with a semantic equivalent we would rather store. */
const TAG_REPLACEMENTS: Record<string, string> = {
  b: 'strong',
  i: 'em',
  s: 'del',
  strike: 'del',
};

/** Anything here starts a new visual line, so unwrapping it has to leave a `<br>` behind. */
const BLOCK_TAGS = new Set(['blockquote', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'ol', 'p', 'ul']);

const ATTRIBUTES_BY_TAG: Record<string, string[]> = { a: ['href', 'target', 'title', 'style'] };
const GENERIC_ATTRIBUTES = ['style', 'title'];

const RGB = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)$/i;

/** The sanitizer rejects parentheses outright, so a browser's `rgb()` has to become hex here. */
function normalizeColor(value: string): string | null {
  const match = RGB.exec(value.trim());
  if (!match) {
    return null;
  }
  const channels = [match[1], match[2], match[3]].map((channel) => {
    const number = Math.min(255, Math.max(0, Number(channel)));
    return number.toString(16).padStart(2, '0');
  });
  return `#${channels.join('')}`.toUpperCase();
}

function filterStyle(style: string | null): string | null {
  if (!style) {
    return null;
  }
  const declarations = style
    .split(';')
    .map((declaration) => {
      const separator = declaration.indexOf(':');
      if (separator < 0) {
        return null;
      }
      const property = declaration.slice(0, separator).trim().toLowerCase();
      if (!RICH_TEXT_STYLE_PROPERTIES.includes(property)) {
        return null;
      }
      const raw = declaration.slice(separator + 1).trim();
      const value = normalizeColor(raw) ?? raw;
      return value.length > 0 ? `${property}: ${value}` : null;
    })
    .filter((declaration): declaration is string => declaration !== null);
  return declarations.length > 0 ? declarations.join('; ') : null;
}

function moveChildren(from: Element, to: Element) {
  while (from.firstChild) {
    to.appendChild(from.firstChild);
  }
}

/** Replaces an element with its own children, keeping the text it was wrapping. */
function unwrap(element: Element) {
  const parent = element.parentNode;
  if (!parent) {
    return;
  }
  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
}

function rename(element: Element, tag: string): Element {
  const next = element.ownerDocument.createElement(tag);
  const style = filterStyle(element.getAttribute('style'));
  if (style) {
    next.setAttribute('style', style);
  }
  moveChildren(element, next);
  element.replaceWith(next);
  return next;
}

function normalizeAttributes(element: Element) {
  const tag = element.tagName.toLowerCase();
  const allowed = ATTRIBUTES_BY_TAG[tag] ?? GENERIC_ATTRIBUTES;
  for (const name of element.getAttributeNames()) {
    if (!allowed.includes(name.toLowerCase())) {
      element.removeAttribute(name);
    }
  }
  const style = filterStyle(element.getAttribute('style'));
  if (style) {
    element.setAttribute('style', style);
  } else {
    element.removeAttribute('style');
  }
}

function normalizeChildren(parent: Element) {
  // Snapshot first: unwrapping mutates the child list underneath the loop.
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) {
      node.parentNode?.removeChild(node);
      continue;
    }
    normalizeElement(node as Element);
  }
}

function normalizeElement(element: Element) {
  const tag = element.tagName.toLowerCase();

  // `<font color>` is what a browser emits for a color when `styleWithCSS` did not take.
  if (tag === 'font') {
    const span = element.ownerDocument.createElement('span');
    const color = element.getAttribute('color');
    const normalized = color ? normalizeColor(color) ?? color : null;
    if (normalized) {
      span.setAttribute('style', `color: ${normalized}`);
    }
    moveChildren(element, span);
    element.replaceWith(span);
    normalizeChildren(span);
    if (!span.hasAttribute('style')) {
      unwrap(span);
    }
    return;
  }

  const replacement = TAG_REPLACEMENTS[tag];
  if (replacement) {
    normalizeChildren(rename(element, replacement));
    return;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    // The line this element stood for still has to survive as a break — but not a leading one.
    if (BLOCK_TAGS.has(tag) && element.previousSibling) {
      element.parentNode?.insertBefore(element.ownerDocument.createElement('br'), element);
    }
    normalizeChildren(element);
    unwrap(element);
    return;
  }

  normalizeAttributes(element);
  normalizeChildren(element);

  // A span that carries nothing is just noise in the stored markup.
  if (tag === 'span' && !element.hasAttribute('style')) {
    unwrap(element);
  }

  // An anchor with no address is not a link — `removeFormat` leaves those behind. `target` is
  // stored only as `_blank`, the one value that means anything in an email client.
  if (tag === 'a') {
    if (!element.getAttribute('href')) {
      unwrap(element);
    } else if (element.getAttribute('target') !== '_blank') {
      element.removeAttribute('target');
    }
  }
}

export default function normalizeRichText(html: string): string {
  const root = document.createElement('div');
  root.innerHTML = html;
  normalizeChildren(root);
  // A trailing break is how a browser keeps the last line focusable; it is not content.
  return root.innerHTML.replace(/(?:<br\s*\/?>)+$/i, '').trim();
}
