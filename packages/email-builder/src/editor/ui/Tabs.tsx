import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs as RadixTabs } from 'radix-ui';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import cn from './cn';
import Tooltip from './Tooltip';

type Props<T extends string> = {
  value: T;
  onValueChange: (v: T) => void;
  children: React.ReactNode;
  className?: string;
};

/** A scroll of one arrow press: most of the row, keeping a tab of context. */
const SCROLL_FRACTION = 0.8;
/** Sub-pixel layout means the ends never land exactly on 0 / scrollWidth. */
const EDGE_SLACK = 1;

type TOverflow = { left: boolean; right: boolean };

/**
 * The row scrolls rather than wraps — the inspector's four tabs do not fit a
 * 320px drawer in every language, and a wrapped row would break the header's
 * fixed height. What overflows has to be discoverable, so the ends that have
 * more behind them get an arrow and a fade; with everything in view the row
 * looks exactly as it did before.
 */
export default function Tabs<T extends string>({ value, onValueChange, children, className }: Props<T>) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [overflow, setOverflow] = useState<TOverflow>({ left: false, right: false });

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const left = list.scrollLeft > EDGE_SLACK;
    const right = list.scrollLeft + list.clientWidth < list.scrollWidth - EDGE_SLACK;
    setOverflow((current) => (current.left === left && current.right === right ? current : { left, right }));
  }, []);

  // Layout effect, so a row that overflows on first paint never flashes without
  // its arrows.
  useLayoutEffect(measure);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') {
      return;
    }
    // The row itself resizes with the drawer, and its content with the tab set
    // — a library appearing adds a tab without the drawer changing at all.
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    for (const child of Array.from(list.children)) {
      observer.observe(child);
    }
    return () => observer.disconnect();
  }, [measure, children]);

  // A tab selected from outside the row — a keyboard arrow, a host switching
  // tabs — has to be brought into view, or the selection is invisible.
  useEffect(() => {
    const selected = listRef.current?.querySelector('[aria-selected="true"]');
    if (selected && typeof selected.scrollIntoView === 'function') {
      selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [value]);

  const scroll = (direction: -1 | 1) => {
    const list = listRef.current;
    list?.scrollBy({ left: direction * list.clientWidth * SCROLL_FRACTION, behavior: 'smooth' });
  };

  return (
    <RadixTabs.Root value={value} onValueChange={(v) => onValueChange(v as T)} className={className}>
      <div className="flex h-full items-stretch">
        <ScrollArrow side="left" shown={overflow.left} onClick={() => scroll(-1)} />
        <RadixTabs.List
          ref={listRef}
          onScroll={measure}
          // Scrollbar hidden on purpose: the arrows and the fade say the row
          // scrolls, and a bar inside a 49px header eats the tab labels.
          className="flex h-full flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ maskImage: maskFor(overflow), WebkitMaskImage: maskFor(overflow) }}
        >
          {children}
        </RadixTabs.List>
        <ScrollArrow side="right" shown={overflow.right} onClick={() => scroll(1)} />
      </div>
    </RadixTabs.Root>
  );
}

/**
 * Fades the tab that runs off an end, so a half-cut label reads as "there is
 * more" rather than as a rendering fault. Only the ends with something behind
 * them are faded, and a row that fits gets no mask at all — a mask always
 * clips, and the focus ring on the first tab sits right on the edge.
 */
function maskFor({ left, right }: TOverflow): string | undefined {
  if (!left && !right) {
    return undefined;
  }
  const start = left ? 'transparent 0, black 24px' : 'black 0';
  const end = right ? 'black calc(100% - 24px), transparent 100%' : 'black 100%';
  return `linear-gradient(to right, ${start}, ${end})`;
}

const ARROW_CLASSES = cn(
  'flex w-6 shrink-0 cursor-pointer items-center justify-center border-b border-transparent text-txt-secondary',
  'transition-colors hover:text-txt-primary',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue'
);

/**
 * Not a tab: it sits outside the `tablist`, and is hidden from assistive
 * technology because scrolling is a pointer affordance — the arrow keys already
 * move through the tabs and bring the selected one into view.
 */
function ScrollArrow({ side, shown, onClick }: { side: 'left' | 'right'; shown: boolean; onClick: () => void }) {
  if (!shown) {
    return null;
  }
  const Icon = side === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button type="button" tabIndex={-1} aria-hidden onClick={onClick} className={ARROW_CLASSES}>
      <Icon className="size-4" />
    </button>
  );
}

const TAB_CLASSES = cn(
  'flex min-w-8 shrink-0 items-center justify-center whitespace-nowrap border-b border-transparent px-3 py-2',
  'text-[14px] font-medium',
  'leading-normal text-txt-secondary transition-colors hover:text-txt-primary',
  // Keyed off aria-selected, not data-state: wrapping a trigger in a Radix
  // Tooltip overwrites data-state with the tooltip's own open/closed value.
  'aria-selected:border-txt-primary aria-selected:text-txt-primary',
  'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue'
);

type TabProps = {
  value: string;
  /** Icon-only tabs need a label somewhere; MUI put a Tooltip inside the tab. */
  tooltip?: string;
  children: React.ReactNode;
};

/**
 * Mirrors the old MUI tab: 500-weight 14px label, secondary until hovered or
 * selected, with a 1px indicator drawn as the bottom border of the active tab.
 */
export function Tab({ value, tooltip, children }: TabProps) {
  const trigger = (
    <RadixTabs.Trigger value={value} aria-label={tooltip} className={TAB_CLASSES}>
      {children}
    </RadixTabs.Trigger>
  );
  if (!tooltip) {
    return trigger;
  }
  return <Tooltip title={tooltip}>{trigger}</Tooltip>;
}
