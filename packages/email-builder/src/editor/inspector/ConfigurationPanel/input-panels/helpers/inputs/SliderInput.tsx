import React, { useState } from 'react';

import Label from '../../../../../ui/Label';

import RawSliderInput from './raw/RawSliderInput';

type SliderInputProps = {
  label: string;
  iconLabel: React.ReactNode;

  step?: number;
  marks?: boolean;
  units: string;
  min?: number;
  max?: number;

  defaultValue: number;
  onChange: (v: number) => void;
};

export default function SliderInput({ label, defaultValue, onChange, ...props }: SliderInputProps) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex flex-col items-start gap-2">
      <Label>{label}</Label>
      <RawSliderInput
        value={value}
        setValue={(value: number) => {
          setValue(value);
          onChange(value);
        }}
        {...props}
      />
    </div>
  );
}
