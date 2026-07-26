import React from 'react';

import { useTranslate } from '../../../../../i18n';
import TextField from '../../../../../ui/TextField';

type TextDimensionInputProps = {
  label: string;
  defaultValue: number | null | undefined;
  onChange: (v: number | null) => void;
};
export default function TextDimensionInput({ label, defaultValue, onChange }: TextDimensionInputProps) {
  const t = useTranslate();
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (ev) => {
    const value = parseInt(ev.target.value);
    onChange(isNaN(value) ? null : value);
  };
  return (
    <TextField
      onChange={handleChange}
      defaultValue={defaultValue ?? ''}
      label={label}
      placeholder={t('input.auto')}
      endAdornment="px"
    />
  );
}
