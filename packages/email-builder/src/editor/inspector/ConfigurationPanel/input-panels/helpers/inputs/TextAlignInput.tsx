import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react';
import React, { useState } from 'react';

import { useTranslate } from '../../../../../i18n';
import { ToggleButton } from '../../../../../ui/ToggleGroup';

import RadioGroupInput from './RadioGroupInput';

type Props = {
  label: string;
  defaultValue: string | null;
  onChange: (value: string | null) => void;
};
export default function TextAlignInput({ label, defaultValue, onChange }: Props) {
  const t = useTranslate();
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
      <ToggleButton value="left" tooltip={t('option.align.left')}>
        <AlignLeft className="size-5" />
      </ToggleButton>
      <ToggleButton value="center" tooltip={t('option.align.center')}>
        <AlignCenter className="size-5" />
      </ToggleButton>
      <ToggleButton value="right" tooltip={t('option.align.right')}>
        <AlignRight className="size-5" />
      </ToggleButton>
    </RadioGroupInput>
  );
}
