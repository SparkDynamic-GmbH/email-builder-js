import { Switch as RadixSwitch } from 'radix-ui';
import React, { useId } from 'react';

type Props = {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
};

export default function Switch({ label, checked, onCheckedChange }: Props) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="relative h-6 w-10 shrink-0 cursor-pointer rounded-full bg-grey-400 transition-colors data-[state=checked]:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
      >
        <RadixSwitch.Thumb className="block size-5 translate-x-0.5 rounded-full bg-white shadow-e1 transition-transform will-change-transform data-[state=checked]:translate-x-[18px]" />
      </RadixSwitch.Root>
      <label htmlFor={id} className="cursor-pointer text-body1 select-none">
        {label}
      </label>
    </div>
  );
}
