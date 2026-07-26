import React from 'react';

import TextField from '../../../../../ui/TextField';

type TextDimensionInputProps = {
  label: string;
  defaultValue: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function TextDimensionInput({ label, defaultValue, onChange }: TextDimensionInputProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const value = parseInt(ev.target.value);
    onChange(isNaN(value) ? null : value);
  };
  return (
    <TextField
      onChange={handleChange}
      defaultValue={defaultValue ?? ''}
      label={label}
      placeholder="auto"
      endAdornment="px"
    />
  );
}
