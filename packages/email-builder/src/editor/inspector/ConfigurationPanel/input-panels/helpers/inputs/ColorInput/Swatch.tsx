import React from 'react';

import cn from '../../../../../../ui/cn';

type Props = {
  paletteColors: string[];
  value: string;
  onChange: (value: string) => void;
};

export default function Swatch({ paletteColors, value, onChange }: Props) {
  const renderButton = (colorValue: string) => {
    return (
      <button
        key={colorValue}
        type="button"
        aria-label={colorValue}
        onClick={() => onChange(colorValue)}
        style={{ backgroundColor: colorValue }}
        className={cn(
          'inline-flex size-6 rounded-sm border hover:border-grey-500',
          value === colorValue ? 'border-black' : 'border-grey-200'
        )}
      />
    );
  };
  return <div className="grid w-full grid-cols-6 gap-2">{paletteColors.map((c) => renderButton(c))}</div>;
}
