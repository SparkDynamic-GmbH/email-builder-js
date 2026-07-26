import { Slider as RadixSlider } from 'radix-ui';
import React, { useMemo } from 'react';

type Props = {
  value: number;
  onValueChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Draws a tick per step, the way MUI's `marks` boolean did. */
  marks?: boolean;
};

export default function Slider({ value, onValueChange, min = 0, max = 100, step = 1, marks }: Props) {
  const markOffsets = useMemo(() => {
    if (!marks || step <= 0 || max <= min) {
      return [];
    }
    const offsets: number[] = [];
    for (let v = min; v <= max; v += step) {
      offsets.push(((v - min) / (max - min)) * 100);
    }
    return offsets;
  }, [marks, min, max, step]);

  return (
    <RadixSlider.Root
      className="relative flex h-4 w-full touch-none items-center select-none"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={([v]) => onValueChange(v)}
    >
      <RadixSlider.Track className="relative h-px w-full grow bg-grey-500">
        <RadixSlider.Range className="absolute h-full bg-brand-blue" />
        {markOffsets.map((offset) => (
          <span
            key={offset}
            className="absolute top-1/2 size-0.5 -translate-1/2 rounded-full bg-grey-500"
            style={{ left: `${offset}%` }}
          />
        ))}
      </RadixSlider.Track>
      <RadixSlider.Thumb
        className="block size-4 cursor-col-resize rounded-full bg-brand-blue transition-shadow hover:shadow-[0_0_0_4px_rgba(0,121,204,0.2)] focus-visible:shadow-[0_0_0_4px_rgba(0,121,204,0.2)] focus-visible:outline-none"
        aria-label="Value"
      />
    </RadixSlider.Root>
  );
}
