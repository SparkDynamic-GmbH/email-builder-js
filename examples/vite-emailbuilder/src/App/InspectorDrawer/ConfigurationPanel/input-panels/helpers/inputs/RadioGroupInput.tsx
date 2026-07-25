import React, { useState } from 'react';

import Label from '../../../../../../ui/Label';
import ToggleGroup from '../../../../../../ui/ToggleGroup';

type Props = {
  label: string | React.JSX.Element;
  children: React.ReactNode;
  defaultValue: string;
  onChange: (v: string) => void;
};
export default function RadioGroupInput({ label, children, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex w-full flex-col items-start gap-1">
      <Label>{label}</Label>
      <ToggleGroup
        fullWidth
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onChange(v);
        }}
      >
        {children}
      </ToggleGroup>
    </div>
  );
}
