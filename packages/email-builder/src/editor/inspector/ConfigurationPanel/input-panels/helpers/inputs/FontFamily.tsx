import React, { useState } from 'react';

import { FONT_FAMILIES } from '../../../../../helpers/fontFamily';
import Select, { SelectOption } from '../../../../../ui/Select';

const OPTIONS: SelectOption[] = [
  { value: 'inherit', label: 'Match email settings' },
  ...FONT_FAMILIES.map((option) => ({
    value: option.key,
    label: option.label,
    fontFamily: option.value,
  })),
];

type NullableProps = {
  label: string;
  onChange: (value: null | string) => void;
  defaultValue: null | string;
};
export function NullableFontFamily({ label, onChange, defaultValue }: NullableProps) {
  const [value, setValue] = useState(defaultValue ?? 'inherit');
  return (
    <Select
      label={label}
      value={value}
      options={OPTIONS}
      onValueChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}
