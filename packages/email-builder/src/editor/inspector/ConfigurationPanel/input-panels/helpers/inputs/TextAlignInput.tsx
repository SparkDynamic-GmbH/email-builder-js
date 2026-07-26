import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import React, { useState } from 'react';

import { ToggleButton } from '../../../../../ui/ToggleGroup';

import RadioGroupInput from './RadioGroupInput';

type Props = {
  label: string;
  defaultValue: string | null;
  onChange: (value: string | null) => void;
};
export default function TextAlignInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue ?? 'left');

  return (
    <RadioGroupInput
      label={label}
      defaultValue={value}
      onChange={(value) => {
        setValue(value);
        onChange(value);
      }}
    >
      <ToggleButton value="left" tooltip="Align left">
        <AlignLeft className="size-5" />
      </ToggleButton>
      <ToggleButton value="center" tooltip="Align center">
        <AlignCenter className="size-5" />
      </ToggleButton>
      <ToggleButton value="right" tooltip="Align right">
        <AlignRight className="size-5" />
      </ToggleButton>
    </RadioGroupInput>
  );
}
