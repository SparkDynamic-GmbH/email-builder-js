import { Baseline, Bold, Italic, RemoveFormatting, Strikethrough, Underline } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslate } from '../../i18n';
import cn from '../../ui/cn';
import PRESET_COLORS from '../../ui/palette';

import { applyColor, clearFormatting, readMarks, TInlineMark, toggleMark } from './commands';

const NO_MARKS: Record<TInlineMark, boolean> = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
};

/** Below this much room above the selection the toolbar would be off-screen, so it flips under. */
const FLIP_THRESHOLD = 56;

const BUTTON = cn(
  'inline-flex size-7 shrink-0 items-center justify-center rounded-sm text-txt-primary',
  'transition-colors hover:bg-black/6',
  // Keyed off aria-pressed rather than a data attribute, matching the ui primitives.
  'aria-pressed:bg-brand-blue/10 aria-pressed:text-brand-blue'
);

type Props = {
  /** The editable element. A selection outside it is not ours to format. */
  containerRef: React.RefObject<HTMLElement | null>;
  active: boolean;
};

/**
 * The formatting toolbar that follows a text selection on the canvas.
 *
 * Two things keep it working. It never takes focus — every pointer press inside it is prevented,
 * because a focus change collapses the selection before the command could run, and it would also
 * blur the editable and commit the block mid-edit. And it writes nothing to the store: commands
 * mutate the live contentEditable DOM, and `InlineEditable` reads the result back on blur, which
 * is what stops React from re-rendering the subtree under the caret.
 */
export default function SelectionToolbar({ containerRef, active }: Props) {
  const t = useTranslate();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [marks, setMarks] = useState(NO_MARKS);
  const [pickingColor, setPickingColor] = useState(false);

  const read = useCallback(() => {
    const container = containerRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setRect(null);
      return;
    }
    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      setRect(null);
      return;
    }
    const bounds = range.getBoundingClientRect();
    if (bounds.width === 0 && bounds.height === 0) {
      setRect(null);
      return;
    }
    setRect(bounds);
    setMarks(readMarks());
  }, [containerRef]);

  useEffect(() => {
    if (!active) {
      setRect(null);
      setPickingColor(false);
      return;
    }
    // `selectionchange` is the only event that reports the selection *after* the browser has
    // settled it; mouseup and keyup both fire while it is still the old one.
    document.addEventListener('selectionchange', read);
    // The rect is viewport-relative and the toolbar is fixed, so it has to follow the page.
    window.addEventListener('scroll', read, true);
    window.addEventListener('resize', read);
    read();
    return () => {
      document.removeEventListener('selectionchange', read);
      window.removeEventListener('scroll', read, true);
      window.removeEventListener('resize', read);
    };
  }, [active, read]);

  if (!active || !rect) {
    return null;
  }

  const below = rect.top < FLIP_THRESHOLD;
  const position: React.CSSProperties = {
    top: below ? rect.bottom + 8 : rect.top - 8,
    left: rect.left + rect.width / 2,
    transform: below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
  };

  const run = (action: () => void) => () => {
    action();
    setMarks(readMarks());
  };

  const renderMark = (mark: TInlineMark, label: string, icon: React.JSX.Element) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={marks[mark]}
      className={BUTTON}
      onClick={run(() => toggleMark(mark))}
    >
      {icon}
    </button>
  );

  return createPortal(
    <div
      role="toolbar"
      aria-label={t('richText.toolbar')}
      style={position}
      className="fixed z-50 flex flex-col gap-1 rounded-sm border border-grey-300 bg-white p-1 shadow-e3"
      // Keeping the selection alive is the whole trick — see the component comment.
      onMouseDown={(ev) => ev.preventDefault()}
      onClick={(ev) => ev.stopPropagation()}
    >
      <div className="flex items-center gap-0.5">
        {renderMark('bold', t('richText.bold'), <Bold className="size-4" />)}
        {renderMark('italic', t('richText.italic'), <Italic className="size-4" />)}
        {renderMark('underline', t('richText.underline'), <Underline className="size-4" />)}
        {renderMark('strikethrough', t('richText.strikethrough'), <Strikethrough className="size-4" />)}
        <span className="mx-0.5 h-5 w-px bg-grey-300" />
        <button
          type="button"
          aria-label={t('richText.color')}
          aria-pressed={pickingColor}
          className={BUTTON}
          onClick={() => setPickingColor((open) => !open)}
        >
          <Baseline className="size-4" />
        </button>
        <button
          type="button"
          aria-label={t('richText.clearFormatting')}
          className={BUTTON}
          onClick={run(() => {
            clearFormatting();
            setPickingColor(false);
          })}
        >
          <RemoveFormatting className="size-4" />
        </button>
      </div>
      {pickingColor && (
        <div className="grid grid-cols-10 gap-1 border-t border-grey-200 pt-1">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              style={{ backgroundColor: color }}
              className="size-4 rounded-xs border border-grey-300 hover:border-grey-600"
              onClick={run(() => {
                applyColor(color);
                setPickingColor(false);
              })}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}
