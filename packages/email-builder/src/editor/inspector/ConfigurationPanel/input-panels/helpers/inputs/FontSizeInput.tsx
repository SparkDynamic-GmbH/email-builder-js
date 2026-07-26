import { Type } from 'lucide-react';
import React, { useState } from 'react';

import Label from '../../../../../ui/Label';

import RawSliderInput from './raw/RawSliderInput';

type Props = {
  label: string;
  defaultValue: number;
  onChange: (v: number) => void;
};
export default function FontSizeInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  const handleChange = (value: number) => {
    setValue(value);
    onChange(value);
  };
  return (
    <div className="flex flex-col items-start gap-2">
      <Label>{label}</Label>
      <RawSliderInput
        iconLabel={<Type className="size-4" />}
        value={value}
        setValue={handleChange}
        units="px"
        step={1}
        min={10}
        max={48}
      />
    </div>
  );
}
