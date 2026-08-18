import {
  AlignHorizontalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignVerticalJustifyStart,
} from 'lucide-react';
import React, { useState } from 'react';

import Label from '../../../../../ui/Label';

import RawSliderInput from './raw/RawSliderInput';

type TPaddingValue = {
  top: number;
  bottom: number;
  right: number;
  left: number;
};
type Props = {
  label: string;
  defaultValue: TPaddingValue | null;
  onChange: (value: TPaddingValue) => void;
  /** Four sliders over the four sides of a box — border widths use it as well as padding. */
  min?: number;
  max?: number;
  step?: number;
};
export default function PaddingInput({ label, defaultValue, onChange, min = 0, max = 80, step = 4 }: Props) {
  const [value, setValue] = useState(() => {
    if (defaultValue) {
      return defaultValue;
    }
    return {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    };
  });

  function handleChange(internalName: keyof TPaddingValue, nValue: number) {
    const v = {
      ...value,
      [internalName]: nValue,
    };
    setValue(v);
    onChange(v);
  }

  return (
    <div className="flex flex-col items-start gap-4 pb-2">
      <Label>{label}</Label>

      <RawSliderInput
        iconLabel={<AlignVerticalJustifyStart className="size-4" />}
        value={value.top}
        setValue={(num) => handleChange('top', num)}
        units="px"
        step={step}
        min={min}
        max={max}
        marks
      />

      <RawSliderInput
        iconLabel={<AlignVerticalJustifyEnd className="size-4" />}
        value={value.bottom}
        setValue={(num) => handleChange('bottom', num)}
        units="px"
        step={step}
        min={min}
        max={max}
        marks
      />

      <RawSliderInput
        iconLabel={<AlignHorizontalJustifyStart className="size-4" />}
        value={value.left}
        setValue={(num) => handleChange('left', num)}
        units="px"
        step={step}
        min={min}
        max={max}
        marks
      />

      <RawSliderInput
        iconLabel={<AlignHorizontalJustifyEnd className="size-4" />}
        value={value.right}
        setValue={(num) => handleChange('right', num)}
        units="px"
        step={step}
        min={min}
        max={max}
        marks
      />
    </div>
  );
}
