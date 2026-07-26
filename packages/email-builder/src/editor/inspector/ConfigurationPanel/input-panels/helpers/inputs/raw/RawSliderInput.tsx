import React from 'react';

import Slider from '../../../../../../ui/Slider';

type SliderInputProps = {
  iconLabel: React.ReactNode;

  step?: number;
  marks?: boolean;
  units: string;
  min?: number;
  max?: number;

  value: number;
  setValue: (v: number) => void;
};

export default function RawSliderInput({ iconLabel, value, setValue, units, ...props }: SliderInputProps) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="min-w-6 shrink-0 leading-none">{iconLabel}</div>
      <Slider {...props} value={value} onValueChange={setValue} />
      <div className="min-w-8 shrink-0 text-right text-body2 leading-none text-txt-secondary">
        {value}
        {units}
      </div>
    </div>
  );
}
