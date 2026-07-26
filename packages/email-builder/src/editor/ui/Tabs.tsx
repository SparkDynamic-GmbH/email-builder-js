import { Tabs as RadixTabs } from 'radix-ui';
import React from 'react';

import cn from './cn';
import Tooltip from './Tooltip';

type Props<T extends string> = {
  value: T;
  onValueChange: (v: T) => void;
  children: React.ReactNode;
  className?: string;
};

export default function Tabs<T extends string>({ value, onValueChange, children, className }: Props<T>) {
  return (
    <RadixTabs.Root value={value} onValueChange={(v) => onValueChange(v as T)} className={className}>
      <RadixTabs.List className="flex h-full items-stretch">{children}</RadixTabs.List>
    </RadixTabs.Root>
  );
}

const TAB_CLASSES = cn(
  'flex min-w-8 items-center justify-center border-b border-transparent px-3 py-2 text-[14px] font-medium',
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
