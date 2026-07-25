import { ToggleGroup as RadixToggleGroup } from 'radix-ui';
import React from 'react';

import cn from './cn';
import Tooltip from './Tooltip';

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  /** MUI's ToggleButtonGroup stretched its buttons when `fullWidth` was set. */
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
};

export default function ToggleGroup({ value, onValueChange, fullWidth, children, className }: Props) {
  return (
    <RadixToggleGroup.Root
      type="single"
      value={value}
      /**
       * Radix emits '' when the pressed item is the active one. MUI's
       * `exclusive` group behaved the same way and every call site treated it
       * as "no change", so swallow it rather than propagating an empty value.
       */
      onValueChange={(v) => {
        if (v !== '') {
          onValueChange(v);
        }
      }}
      className={cn('inline-flex rounded-sm', fullWidth && 'w-full', className)}
    >
      {children}
    </RadixToggleGroup.Root>
  );
}

const ITEM_CLASSES = cn(
  'inline-flex flex-1 items-center justify-center border border-grey-300 px-3 py-1.5 text-[13px]',
  'font-medium text-txt-secondary transition-colors first:rounded-l-sm last:rounded-r-sm',
  'not-first:-ml-px hover:bg-black/4',
  // Keyed off aria-checked, not data-state: wrapping an item in a Radix Tooltip
  // overwrites data-state with the tooltip's own open/closed value.
  'aria-checked:bg-brand-blue/8 aria-checked:text-brand-blue aria-checked:border-brand-blue/50',
  'aria-checked:z-1 focus-visible:z-1 focus-visible:outline-2 focus-visible:-outline-offset-2',
  'focus-visible:outline-brand-blue'
);

type ItemProps = {
  value: string;
  /** Icon-only buttons need an accessible name; MUI nested a Tooltip inside. */
  tooltip?: string;
  children: React.ReactNode;
};

export function ToggleButton({ value, tooltip, children }: ItemProps) {
  const item = (
    <RadixToggleGroup.Item value={value} aria-label={tooltip} className={ITEM_CLASSES}>
      {children}
    </RadixToggleGroup.Item>
  );
  if (!tooltip) {
    return item;
  }
  return <Tooltip title={tooltip}>{item}</Tooltip>;
}
