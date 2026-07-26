import { ChevronDown } from 'lucide-react';
import { Select as RadixSelect } from 'radix-ui';
import React, { useId } from 'react';

import Label from './Label';

export type SelectOption = {
  value: string;
  label: string;
  /** Renders the option in its own typeface — used by the font-family picker. */
  fontFamily?: string;
};

type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onValueChange: (v: string) => void;
};

export default function Select({ label, value, options, onValueChange }: Props) {
  const id = useId();
  return (
    <div className="flex w-full flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger
          id={id}
          className="flex w-full items-center justify-between gap-2 border-b border-grey-400 py-1 text-left text-body1 transition-colors hover:border-grey-500 focus-visible:border-txt-primary focus-visible:outline-none"
        >
          <RadixSelect.Value />
          <RadixSelect.Icon>
            <ChevronDown className="size-4 text-txt-secondary" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className="z-50 max-h-72 overflow-auto rounded-sm bg-white py-1 shadow-e3"
          >
            <RadixSelect.Viewport>
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  style={option.fontFamily ? { fontFamily: option.fontFamily } : undefined}
                  className="cursor-pointer px-4 py-1.5 text-body1 outline-none select-none data-[highlighted]:bg-black/4 data-[state=checked]:bg-brand-blue/8"
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
