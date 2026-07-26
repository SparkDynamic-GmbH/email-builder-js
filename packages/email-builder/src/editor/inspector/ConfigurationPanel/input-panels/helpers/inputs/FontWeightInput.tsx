import React, { useState } from 'react';

import { useTranslate } from '../../../../../i18n';
import { ToggleButton } from '../../../../../ui/ToggleGroup';

import RadioGroupInput from './RadioGroupInput';

type Props = {
  label: string;
  defaultValue: string;
  onChange: (value: string) => void;
};
export default function FontWeightInput({ label, defaultValue, onChange }: Props) {
  const t = useTranslate();
  const [value, setValue] = useState(defaultValue);
  return (
    <RadioGroupInput
      label={label}
      defaultValue={value}
      onChange={(fontWeight) => {
        setValue(fontWeight);
        onChange(fontWeight);
      }}
    >
      <ToggleButton value="normal">{t('option.fontWeight.regular')}</ToggleButton>
      <ToggleButton value="bold">{t('option.fontWeight.bold')}</ToggleButton>
    </RadioGroupInput>
  );
}
