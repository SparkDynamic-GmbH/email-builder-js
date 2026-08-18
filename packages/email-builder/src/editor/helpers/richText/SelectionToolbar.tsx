import { Baseline, Bold, Italic, Link2, Link2Off, RemoveFormatting, Strikethrough, Underline } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { useTranslate } from '../../i18n';
import cn from '../../ui/cn';
import PRESET_COLORS from '../../ui/palette';

import {
  applyColor,
  applyLink,
  clearFormatting,
  currentLink,
  readMarks,
  removeLink,
  TInlineMark,
  toggleMark,
} from './commands';

const NO_MARKS: Record<TInlineMark, boolean> = {
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
};

/** Below this much room above the selection the toolbar would be off-screen, so it flips under. */
const FLIP_THRESHOLD = 56;

/** `InlineEditable` reads this to tell a click into the toolbar from a real blur. */
export const TOOLBAR_ATTRIBUTE = 'data-rich-text-toolbar';

/** Marks the one part of the toolbar that is allowed to take focus — see the component comment. */
const LINK_PANEL_ATTRIBUTE = 'data-rich-text-link-panel';

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
 *
 * The link panel is the one exception, because a URL field has to be typed into. It works by
 * suspending both halves of that arrangement while it is open: the range is saved before focus
 * moves and restored before the command runs, `InlineEditable` treats a blur into the toolbar as
 * no blur at all, and the selection is not re-read while the field has the caret.
 *
 * A collapsed caret inside a link shows the toolbar too, positioned over the link. That is what
 * makes clicking a link on the canvas open its settings rather than follow it — the click that
 * starts editing already lands the caret in the right place.
 */
export default function SelectionToolbar({ containerRef, active }: Props) {
  const t = useTranslate();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [marks, setMarks] = useState(NO_MARKS);
  const [pickingColor, setPickingColor] = useState(false);
  const [linkPanel, setLinkPanel] = useState(false);
  const [href, setHref] = useState('');
  const [newTab, setNewTab] = useState(true);
  const [onLink, setOnLink] = useState(false);

  // The selection as it was before the URL field took focus, and the link the panel last opened
  // itself for — without the latter, every selection change would reopen a panel just dismissed.
  const savedRange = useRef<Range | null>(null);
  const autoOpenedFor = useRef<Element | null>(null);
  const linkPanelRef = useRef(false);
  linkPanelRef.current = linkPanel;

  const hide = useCallback(() => {
    setRect(null);
    setOnLink(false);
    autoOpenedFor.current = null;
  }, []);

  const seedFromLink = useCallback((anchor: HTMLAnchorElement | null) => {
    setHref(anchor?.getAttribute('href') ?? '');
    setNewTab(anchor ? anchor.getAttribute('target') === '_blank' : true);
  }, []);

  const read = useCallback(() => {
    const container = containerRef.current;
    const selection = window.getSelection();
    if (!container || !selection || selection.rangeCount === 0) {
      hide();
      return;
    }
    const range = selection.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) {
      hide();
      return;
    }
    // Kept up to date on every read rather than only when the panel is opened by hand: the panel
    // also opens itself for a caret inside a link, and either way the field is about to take focus.
    savedRange.current = range.cloneRange();
    const anchor = currentLink(container);

    if (selection.isCollapsed) {
      // Nothing selected and no link under the caret — there is nothing to act on.
      if (!anchor) {
        hide();
        return;
      }
      setRect(anchor.getBoundingClientRect());
      setOnLink(true);
      setMarks(readMarks());
      if (autoOpenedFor.current !== anchor) {
        autoOpenedFor.current = anchor;
        seedFromLink(anchor);
        setLinkPanel(true);
        setPickingColor(false);
      }
      return;
    }

    const bounds = range.getBoundingClientRect();
    if (bounds.width === 0 && bounds.height === 0) {
      hide();
      return;
    }
    setRect(bounds);
    setMarks(readMarks());
    setOnLink(anchor !== null);
    autoOpenedFor.current = null;
  }, [containerRef, hide, seedFromLink]);

  useEffect(() => {
    if (!active) {
      hide();
      setPickingColor(false);
      setLinkPanel(false);
      return;
    }
    // While the URL field holds the caret the selection is not in the editable, and re-reading it
    // would take the toolbar down mid-edit.
    const handle = () => {
      if (!linkPanelRef.current) {
        read();
      }
    };
    // `selectionchange` is the only event that reports the selection *after* the browser has
    // settled it; mouseup and keyup both fire while it is still the old one.
    document.addEventListener('selectionchange', handle);
    // The rect is viewport-relative and the toolbar is fixed, so it has to follow the page.
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    read();
    return () => {
      document.removeEventListener('selectionchange', handle);
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [active, read, hide]);

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

  /**
   * Runs a command against the editable's own selection, putting the caret back first if the URL
   * field has taken it. The saved range is only used when the live selection has actually left the
   * container: applying a link replaces the text nodes it wrapped, so a range saved before that
   * still points at nodes no longer in the document.
   */
  const withRestoredSelection = (action: (container: HTMLElement) => void) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const selection = window.getSelection();
    const live =
      selection && selection.rangeCount > 0 && container.contains(selection.getRangeAt(0).commonAncestorContainer);
    container.focus({ preventScroll: true });
    if (!live && savedRange.current && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange.current);
    }
    action(container);
    savedRange.current = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    setLinkPanel(false);
    autoOpenedFor.current = currentLink(container);
    setMarks(readMarks());
    read();
  };

  const openLinkPanel = () => {
    const container = containerRef.current;
    const selection = window.getSelection();
    savedRange.current = selection && selection.rangeCount > 0 ? selection.getRangeAt(0).cloneRange() : null;
    seedFromLink(container ? currentLink(container) : null);
    setPickingColor(false);
    setLinkPanel(true);
  };

  const closeLinkPanel = () => {
    setLinkPanel(false);
    containerRef.current?.focus({ preventScroll: true });
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
      {...{ [TOOLBAR_ATTRIBUTE]: '' }}
      style={position}
      className="fixed z-50 flex w-max flex-col gap-1 rounded-sm border border-grey-300 bg-white p-1 shadow-e3"
      // Keeping the selection alive is the whole trick — see the component comment. The link panel
      // is exempt: its field is useless without focus, and it saves the range instead.
      onMouseDown={(ev) => {
        // Only the link panel's *fields* are exempt. Its buttons are commands like any other, and
        // letting them take focus would leave the caret outside the editable when they run.
        const target = ev.target as HTMLElement;
        if (!(target.closest(`[${LINK_PANEL_ATTRIBUTE}]`) && target.closest('input, label'))) {
          ev.preventDefault();
        }
      }}
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
          onClick={() => {
            setLinkPanel(false);
            setPickingColor((open) => !open);
          }}
        >
          <Baseline className="size-4" />
        </button>
        <button
          type="button"
          aria-label={onLink ? t('richText.editLink') : t('richText.link')}
          aria-pressed={linkPanel || onLink}
          className={BUTTON}
          onClick={() => (linkPanel ? closeLinkPanel() : openLinkPanel())}
        >
          <Link2 className="size-4" />
        </button>
        {onLink && (
          <button
            type="button"
            aria-label={t('richText.removeLink')}
            className={BUTTON}
            onClick={() => withRestoredSelection((container) => removeLink(container))}
          >
            <Link2Off className="size-4" />
          </button>
        )}
        <button
          type="button"
          aria-label={t('richText.clearFormatting')}
          className={BUTTON}
          onClick={run(() => {
            clearFormatting();
            setPickingColor(false);
            setLinkPanel(false);
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
      {linkPanel && (
        <div {...{ [LINK_PANEL_ATTRIBUTE]: '' }} className="flex w-64 flex-col gap-2 border-t border-grey-200 p-1 pt-2">
          <input
            autoFocus
            type="url"
            value={href}
            placeholder={t('richText.linkPlaceholder')}
            aria-label={t('richText.linkUrl')}
            className="w-full border-b border-grey-400 bg-transparent py-1 text-body1 text-txt-primary outline-none placeholder:text-grey-500 focus:border-txt-primary"
            onChange={(ev) => setHref(ev.target.value)}
            onKeyDown={(ev) => {
              ev.stopPropagation();
              if (ev.key === 'Enter') {
                ev.preventDefault();
                withRestoredSelection((container) => applyLink(container, href, newTab));
              } else if (ev.key === 'Escape') {
                ev.preventDefault();
                closeLinkPanel();
              }
            }}
          />
          <label className="flex cursor-pointer items-center gap-2 text-body2 text-txt-secondary select-none">
            <input
              type="checkbox"
              checked={newTab}
              className="size-3.5 cursor-pointer accent-brand-blue"
              onChange={(ev) => setNewTab(ev.target.checked)}
            />
            {t('richText.linkNewTab')}
          </label>
          <div className="flex items-center justify-end gap-1">
            {onLink && (
              <button
                type="button"
                className="cursor-pointer rounded-sm px-2 py-1 text-body2 text-txt-primary hover:bg-black/6"
                onClick={() => withRestoredSelection((container) => removeLink(container))}
              >
                {t('richText.removeLink')}
              </button>
            )}
            <button
              type="button"
              disabled={href.trim().length === 0}
              className="cursor-pointer rounded-sm bg-brand-blue px-2 py-1 text-body2 text-white hover:bg-brand-blue/90 disabled:pointer-events-none disabled:opacity-60"
              onClick={() => withRestoredSelection((container) => applyLink(container, href, newTab))}
            >
              {t('richText.linkApply')}
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
