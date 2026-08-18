import { ChevronDown } from 'lucide-react';
import { Accordion as RadixAccordion } from 'radix-ui';
import React from 'react';

type Props = {
  /** Which item is open, or `''` for none. Controlled — the caller owns it. */
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

/**
 * One-at-a-time disclosure list. Collapsible, so clicking the open item closes
 * it and the value goes back to `''`.
 */
export default function Accordion({ value, onValueChange, children }: Props) {
  return (
    <RadixAccordion.Root type="single" collapsible value={value} onValueChange={onValueChange} className="w-full">
      {children}
    </RadixAccordion.Root>
  );
}

type ItemProps = {
  value: string;
  label: React.ReactNode;
  children: React.ReactNode;
};

export function AccordionItem({ value, label, children }: ItemProps) {
  return (
    <RadixAccordion.Item value={value} className="border-b border-divider">
      <RadixAccordion.Header>
        {/* Open state is read off `aria-expanded`, not `data-state` — see the
            note on the ui primitives in CLAUDE.md. */}
        <RadixAccordion.Trigger className="flex w-full cursor-pointer items-center justify-between gap-2 py-2.5 text-left text-body1 transition-colors hover:bg-black/4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue aria-expanded:[&>svg]:rotate-180">
          {label}
          <ChevronDown className="size-4 shrink-0 text-txt-secondary transition-transform" />
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content>{children}</RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}
