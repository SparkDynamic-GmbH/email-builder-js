import { Tooltip as RadixTooltip } from 'radix-ui';
import React from 'react';

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <RadixTooltip.Provider delayDuration={200}>{children}</RadixTooltip.Provider>;
}

type Props = {
  title: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  children: React.ReactNode;
};

/**
 * Radix requires a single focusable child it can attach a ref to. `asChild`
 * forwards onto whatever is passed in, which is always one of our buttons.
 */
export default function Tooltip({ title, side = 'top', align = 'center', children }: Props) {
  return (
    <RadixTooltip.Root>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          align={align}
          sideOffset={4}
          className="z-50 rounded-sm bg-txt-primary/90 px-2 py-1 text-[12px] leading-normal text-white select-none"
        >
          {title}
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
}
