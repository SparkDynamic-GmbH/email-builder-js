import { Popover as RadixPopover } from 'radix-ui';
import React from 'react';

import cn from './cn';

type Props = {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  children: React.ReactNode;
};

/**
 * Stands in for MUI's anchorEl-driven `<Menu>`: the trigger anchors the panel,
 * so call sites no longer have to thread an anchor element through state.
 */
export default function Popover({
  trigger,
  open,
  onOpenChange,
  side = 'bottom',
  align = 'center',
  contentClassName,
  children,
}: Props) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side={side}
          align={align}
          sideOffset={4}
          className={cn('z-50 rounded-sm bg-white shadow-e3', contentClassName)}
          onClick={(ev) => ev.stopPropagation()}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
