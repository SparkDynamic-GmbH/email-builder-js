import React, { useState } from 'react';

import Switch from '../../../../../../ui/Switch';

type Props = {
  label: string;
  defaultValue: boolean;
  onChange: (value: boolean) => void;
};

export default function BooleanInput({ label, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);
  return (
    <Switch
      label={label}
      checked={value}
      onCheckedChange={(checked) => {
        setValue(checked);
        onChange(checked);
      }}
    />
  );
}
