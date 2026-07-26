import React, { Fragment, useEffect, useRef, useState } from 'react';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { useSelectedBlockId } from '../../editor/EditorContext';

import { insertLineBreak } from './richText/commands';
import normalizeRichText from './richText/normalize';
import SelectionToolbar from './richText/SelectionToolbar';

/**
 * `contentEditable="plaintext-only"` keeps the browser from injecting markup we cannot store —
 * the blocks hold a plain string. Firefox only shipped it in 136, so detect and fall back.
 */
const PLAINTEXT_ONLY_SUPPORTED = (() => {
  if (typeof document === 'undefined') {
    return false;
  }
  const el = document.createElement('div');
  try {
    el.contentEditable = 'plaintext-only';
  } catch {
    return false;
  }
  return el.contentEditable === 'plaintext-only';
})();

type CaretDocument = {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

function placeCaretFromPoint(x: number, y: number): boolean {
  const selection = window.getSelection();
  if (!selection) {
    return false;
  }
  const d = document as unknown as CaretDocument;
  let range: Range | null = null;
  if (typeof d.caretPositionFromPoint === 'function') {
    const position = d.caretPositionFromPoint(x, y);
    if (position) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  } else if (typeof d.caretRangeFromPoint === 'function') {
    range = d.caretRangeFromPoint(x, y);
  }
  if (!range) {
    return false;
  }
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}

function placeCaretAtEnd(el: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Allow line breaks. Single-line hosts (heading, button label) commit on Enter instead. */
  multiline?: boolean;
  /**
   * Hold inline marks — bold, italic, colour — instead of a plain string, and show the selection
   * toolbar that applies them. The value becomes a fragment of inline HTML.
   */
  rich?: boolean;
  disabled?: boolean;
  children: React.JSX.Element;
};

/**
 * Makes the rendered block itself editable on the canvas instead of only through the sidebar.
 *
 * The rendered DOM *is* the editing surface, so no block styling is duplicated here. While editing,
 * nothing is written to the store — React must not re-render the subtree under the caret. The value
 * is read back on blur or Enter and committed then; Escape discards.
 *
 * In `rich` mode the value read back is normalized `innerHTML` rather than `innerText`, and the
 * browser is allowed to build markup because there is now somewhere to put it.
 */
export default function InlineEditable({
  value,
  onChange,
  multiline = false,
  rich = false,
  disabled = false,
  children,
}: Props) {
  const blockId = useCurrentBlockId();
  const selectedBlockId = useSelectedBlockId();
  const isSelected = selectedBlockId === blockId;

  const ref = useRef<HTMLDivElement>(null);
  const pendingCaret = useRef<{ x: number; y: number } | null>(null);
  const [editing, setEditing] = useState(false);
  // Remounts the children, discarding whatever DOM the browser built while editing.
  const [revision, setRevision] = useState(0);

  const stopEditing = () => {
    setEditing(false);
    setRevision((r) => r + 1);
  };

  const startEditing = (ev: React.MouseEvent) => {
    if (disabled || editing) {
      return;
    }
    pendingCaret.current = { x: ev.clientX, y: ev.clientY };
    setEditing(true);
  };

  const commit = () => {
    const el = ref.current;
    if (!el) {
      return;
    }
    let next: string;
    if (rich) {
      next = normalizeRichText(el.innerHTML);
    } else {
      const raw = el.innerText;
      // A trailing <br> is how browsers keep an editable line focusable; it is not content.
      next = multiline ? raw.replace(/\n+$/, '') : raw.replace(/\s+/g, ' ').trim();
    }
    if (next !== value) {
      onChange(next);
    }
  };

  useEffect(() => {
    if (editing && (disabled || !isSelected)) {
      stopEditing();
    }
  }, [editing, disabled, isSelected]);

  useEffect(() => {
    if (!editing) {
      return;
    }
    const el = ref.current;
    if (!el) {
      return;
    }
    el.focus({ preventScroll: true });
    const caret = pendingCaret.current;
    pendingCaret.current = null;
    if (!caret || !placeCaretFromPoint(caret.x, caret.y)) {
      placeCaretAtEnd(el);
    }
  }, [editing]);

  const handleKeyDown = (ev: React.KeyboardEvent) => {
    if (!editing) {
      return;
    }
    ev.stopPropagation();
    if (ev.key === 'Escape') {
      ev.preventDefault();
      stopEditing();
      return;
    }
    if (ev.key === 'Enter' && (!multiline || ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault();
      commit();
      stopEditing();
      return;
    }
    // Chrome wraps each new line in a `<div>`, which the stored markup has no room for.
    if (ev.key === 'Enter' && rich) {
      ev.preventDefault();
      insertLineBreak();
    }
  };

  const handlePaste = (ev: React.ClipboardEvent) => {
    // Rich mode still takes plain text only: pasted markup would arrive with the source's own
    // fonts and layout, and almost none of it survives the sanitizer anyway.
    if (!editing || (PLAINTEXT_ONLY_SUPPORTED && !rich)) {
      return;
    }
    ev.preventDefault();
    const text = ev.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, multiline ? text : text.replace(/\s+/g, ' '));
  };

  const editableProps = editing
    ? ({
        contentEditable: PLAINTEXT_ONLY_SUPPORTED && !rich ? 'plaintext-only' : true,
        suppressContentEditableWarning: true,
      } as const)
    : {};

  let className: string | undefined;
  if (editing) {
    className = 'outline-none';
  } else if (isSelected && !disabled) {
    className = 'cursor-text';
  }

  return (
    <>
      <div
        ref={ref}
        {...editableProps}
        className={className}
        onClick={(ev) => {
          // First click selects the block (EditorBlockWrapper); clicking a selected block starts editing.
          if (isSelected) {
            startEditing(ev);
          }
        }}
        onDoubleClick={startEditing}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => {
          if (!editing) {
            return;
          }
          commit();
          stopEditing();
        }}
      >
        <Fragment key={revision}>{children}</Fragment>
      </div>
      {/* A sibling, not a child: the toolbar portals away, and nothing that is not content may
          sit inside the element `commit` reads back. */}
      {rich && <SelectionToolbar containerRef={ref} active={editing} />}
    </>
  );
}
