import React, { useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';

import PRESET_COLORS from '../../../../../../ui/palette';

import Swatch from './Swatch';

type Props = {
  value: string;
  onChange: (v: string) => void;
};
export default function Picker({ value, onChange }: Props) {
  const [internalValue, setInternalValue] = useState(value);
  const handleChange = (v: string) => {
    setInternalValue(v);
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      onChange(v);
    }
  };

  return (
    <div className="color-picker flex flex-col gap-2 p-2">
      <HexColorPicker color={value} onChange={handleChange} />
      <Swatch paletteColors={PRESET_COLORS} value={value} onChange={handleChange} />
      <div className="pt-2">
        <HexColorInput prefixed color={internalValue} onChange={handleChange} />
      </div>
    </div>
  );
}
