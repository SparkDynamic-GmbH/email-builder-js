/**
 * Formatting is applied with `document.execCommand`. It is deprecated but universally
 * implemented, and it is the only API that edits a live contentEditable selection without a
 * document model to back it — which is the whole point here: the rendered block *is* the editing
 * surface, so there is no model to edit. Whatever markup a browser happens to produce is put back
 * into shape by `normalizeRichText` on commit.
 */

export type TInlineMark = 'bold' | 'italic' | 'underline' | 'strikethrough';

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
