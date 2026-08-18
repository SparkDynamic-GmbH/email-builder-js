/**
 * Formatting is applied with `document.execCommand`. It is deprecated but universally
 * implemented, and it is the only API that edits a live contentEditable selection without a
 * document model to back it — which is the whole point here: the rendered block *is* the editing
 * surface, so there is no model to edit. Whatever markup a browser happens to produce is put back
 * into shape by `normalizeRichText` on commit.
 */

import { normalizeColor } from './normalize';

export type TInlineMark = 'bold' | 'italic' | 'underline' | 'strikethrough';

/**
 * How a link looks. It lives on the anchor itself rather than on a span inside it, because a mail
 * client's own link rule — blue and underlined — targets `a` and outranks whatever a descendant
 * declares. `color: null` means "leave it to the client", which is the default a new link gets.
 */
export type TLinkStyle = {
  color: string | null;
  underline: boolean;
};

export const DEFAULT_LINK_STYLE: TLinkStyle = { color: null, underline: true };

const MARK_COMMANDS: Record<TInlineMark, string> = {
  bold: 'bold',
  italic: 'italic',
  underline: 'underline',
  strikethrough: 'strikeThrough',
};

function setStyleWithCSS(enabled: boolean) {
  try {
    document.execCommand('styleWithCSS', false, String(enabled));
  } catch {
    // Firefox throws when the command is unsupported; the normalizer copes with either output.
  }
}

/**
 * `styleWithCSS` is turned *off* for the four marks, so browsers emit `<b>`/`<i>`/`<u>`/`<strike>`
 * rather than styled spans. That is what we want in email: Outlook's Word engine renders those
 * tags reliably but is patchy on `text-decoration` written as CSS.
 */
export function toggleMark(mark: TInlineMark) {
  setStyleWithCSS(false);
  document.execCommand(MARK_COMMANDS[mark], false);
}

/** Turned *on* for color, or `foreColor` emits a `<font color>` the sanitizer would drop. */
export function applyColor(color: string) {
  setStyleWithCSS(true);
  document.execCommand('foreColor', false, color);
}

export function clearFormatting() {
  document.execCommand('removeFormat', false);
}

export function readMarks(): Record<TInlineMark, boolean> {
  const read = (mark: TInlineMark) => {
    try {
      return document.queryCommandState(MARK_COMMANDS[mark]);
    } catch {
      return false;
    }
  };
  return {
    bold: read('bold'),
    italic: read('italic'),
    underline: read('underline'),
    strikethrough: read('strikethrough'),
  };
}

/**
 * Keeps a multiline block on `<br>` instead of the `<div>` per line that Chrome inserts, so the
 * stored markup stays inline — which is all the sanitizer allows through.
 */
export function insertLineBreak() {
  document.execCommand('insertLineBreak', false);
}

/**
 * The anchor the selection sits in, if any. A collapsed caret inside a link counts — that is how
 * clicking a link on the canvas opens its settings without first having to select its words.
 */
export function currentLink(container: HTMLElement): HTMLAnchorElement | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  const range = selection.getRangeAt(0);
  let node: Node | null = range.commonAncestorContainer;
  while (node && node !== container) {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'A') {
      return node as HTMLAnchorElement;
    }
    node = node.parentNode;
  }
  // A range that wraps a whole link exactly has the link as a child, not an ancestor.
  if (!selection.isCollapsed) {
    const inside = Array.from(container.querySelectorAll('a')).filter((a) => range.intersectsNode(a));
    if (inside.length === 1) {
      return inside[0];
    }
  }
  return null;
}

/** Every anchor the selection touches — what `createLink` may have produced, which can be several. */
function linksInSelection(container: HTMLElement): HTMLAnchorElement[] {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return [];
  }
  const range = selection.getRangeAt(0);
  const found = Array.from(container.querySelectorAll('a')).filter((a) => range.intersectsNode(a));
  const ancestor = currentLink(container);
  if (ancestor && !found.includes(ancestor)) {
    found.push(ancestor);
  }
  return found;
}

/**
 * A bare `example.com` is what people type; the sanitizer only passes http, https and mailto, so
 * anything without a scheme is assumed to be a web address rather than dropped on render.
 */
export function normalizeHref(raw: string): string {
  const href = raw.trim();
  if (href.length === 0) {
    return '';
  }
  if (/^(https?:|mailto:)/i.test(href)) {
    return href;
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) {
    return `mailto:${href}`;
  }
  return `https://${href}`;
}

/** Reads back what {@link applyLinkStyle} wrote, so the panel opens showing the link's own look. */
export function readLinkStyle(anchor: HTMLAnchorElement | null): TLinkStyle {
  if (!anchor) {
    return DEFAULT_LINK_STYLE;
  }
  const color = anchor.style.color;
  return {
    color: color ? normalizeColor(color) ?? color : null,
    underline: anchor.style.textDecorationLine !== 'none' && anchor.style.textDecoration !== 'none',
  };
}

/**
 * Writes the look onto the anchor, and clears any `color` the toolbar's own color button left on
 * spans underneath — those are more specific than the anchor and would win in a browser, which
 * would make the picked link color look like it had not applied at all.
 */
export function applyLinkStyle(anchor: HTMLAnchorElement, style: TLinkStyle) {
  if (style.color) {
    anchor.style.color = style.color;
    for (const span of Array.from(anchor.querySelectorAll<HTMLElement>('[style]'))) {
      span.style.removeProperty('color');
      if (!span.getAttribute('style')) {
        span.removeAttribute('style');
      }
    }
  } else {
    anchor.style.removeProperty('color');
  }
  if (style.underline) {
    anchor.style.removeProperty('text-decoration');
  } else {
    anchor.style.textDecoration = 'none';
  }
  if (!anchor.getAttribute('style')) {
    anchor.removeAttribute('style');
  }
}

/**
 * Applies a link to the selection, or retargets the one it is already inside. `createLink` needs
 * a non-collapsed selection, so editing an existing link goes through the element directly —
 * which is also what lets the caret alone be enough to change a link's address.
 */
export function applyLink(container: HTMLElement, href: string, newTab: boolean, style: TLinkStyle) {
  const url = normalizeHref(href);
  if (url.length === 0) {
    return;
  }
  const existing = currentLink(container);
  const selection = window.getSelection();
  if (existing && (!selection || selection.isCollapsed)) {
    existing.setAttribute('href', url);
  } else {
    setStyleWithCSS(false);
    document.execCommand('createLink', false, url);
  }
  for (const anchor of existing ? [existing, ...linksInSelection(container)] : linksInSelection(container)) {
    anchor.setAttribute('href', url);
    if (newTab) {
      anchor.setAttribute('target', '_blank');
    } else {
      anchor.removeAttribute('target');
    }
    applyLinkStyle(anchor, style);
  }
}

/**
 * Unwraps the link, keeping its words. `unlink` only reaches a non-collapsed selection, so a bare
 * caret inside a link has its anchor unwrapped by hand.
 */
export function removeLink(container: HTMLElement) {
  const selection = window.getSelection();
  if (selection && !selection.isCollapsed) {
    document.execCommand('unlink', false);
    return;
  }
  const anchor = currentLink(container);
  if (!anchor?.parentNode) {
    return;
  }
  const parent = anchor.parentNode;
  while (anchor.firstChild) {
    parent.insertBefore(anchor.firstChild, anchor);
  }
  parent.removeChild(anchor);
}
