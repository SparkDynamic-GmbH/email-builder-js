import React, { Fragment, useEffect, useRef, useState } from 'react';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { useSelectedBlockId } from '../../editor/EditorContext';

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
  disabled?: boolean;
  children: React.JSX.Element;
};

/**
 * Makes the rendered block itself editable on the canvas instead of only through the sidebar.
 *
 * The rendered DOM *is* the editing surface, so no block styling is duplicated here. While editing,
 * nothing is written to the store — React must not re-render the subtree under the caret. The value
 * is read back with `innerText` and committed on blur or Enter; Escape discards.
 */
export default function InlineEditable({ value, onChange, multiline = false, disabled = false, children }: Props) {
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
    const raw = el.innerText;
    // A trailing <br> is how browsers keep an editable line focusable; it is not content.
    const next = multiline ? raw.replace(/\n+$/, '') : raw.replace(/\s+/g, ' ').trim();
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
    }
  };

  const handlePaste = (ev: React.ClipboardEvent) => {
    if (!editing || PLAINTEXT_ONLY_SUPPORTED) {
      return;
    }
    ev.preventDefault();
    const text = ev.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, multiline ? text : text.replace(/\s+/g, ' '));
  };

  const editableProps = editing
    ? ({
        contentEditable: PLAINTEXT_ONLY_SUPPORTED ? 'plaintext-only' : true,
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
  );
}
