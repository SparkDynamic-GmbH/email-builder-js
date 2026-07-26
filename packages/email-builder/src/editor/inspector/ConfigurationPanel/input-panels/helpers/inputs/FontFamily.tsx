import React, { useMemo, useState } from 'react';

import { FONT_FAMILIES } from '../../../../../helpers/fontFamily';
import { TTranslate, useTranslate } from '../../../../../i18n';
import Select, { SelectOption } from '../../../../../ui/Select';

// The font names are translated under `fontFamily.<key>`; `option.label` is the
// English wording the list itself carries, kept as the fallback.
function buildOptions(t: TTranslate): SelectOption[] {
  return [
    { value: 'inherit', label: t('option.fontFamily.inherit') },
    ...FONT_FAMILIES.map((option) => ({
      value: option.key,
      label: t(`fontFamily.${option.key}`),
      fontFamily: option.value,
    })),
  ];
}

type NullableProps = {
  label: string;
  onChange: (value: null | string) => void;
  defaultValue: null | string;
};
export function NullableFontFamily({ label, onChange, defaultValue }: NullableProps) {
  const t = useTranslate();
  const [value, setValue] = useState(defaultValue ?? 'inherit');
  const options = useMemo(() => buildOptions(t), [t]);
  return (
    <Select
      label={label}
      value={value}
      options={options}
      onValueChange={(v) => {
        setValue(v);
        onChange(v);
      }}
    />
  );
}
