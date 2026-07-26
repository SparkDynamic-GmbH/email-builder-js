import React, { useEffect, useRef, useState } from 'react';

import TextField from '../../../../../ui/TextField';

type Props = {
  label: string;
  rows?: number;
  placeholder?: string;
  helperText?: string | React.JSX.Element;
  defaultValue: string;
  onChange: (v: string) => void;
};
export default function TextInput({ helperText, label, placeholder, rows, defaultValue, onChange }: Props) {
  const [value, setValue] = useState(defaultValue);

  // Adopt changes made elsewhere — inline editing on the canvas writes to the same block.
  const lastDefaultValue = useRef(defaultValue);
  useEffect(() => {
    if (defaultValue !== lastDefaultValue.current) {
      lastDefaultValue.current = defaultValue;
      setValue(defaultValue);
    }
  }, [defaultValue]);

  return (
    <TextField
      rows={rows}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      value={value}
      onChange={(ev) => {
        const v = ev.target.value;
        setValue(v);
        onChange(v);
      }}
    />
  );
}
