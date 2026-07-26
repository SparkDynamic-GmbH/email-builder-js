import { Plus, X } from 'lucide-react';
import React, { useState } from 'react';

import { useTranslate } from '../../../../../../i18n';
import Label from '../../../../../../ui/Label';
import Popover from '../../../../../../ui/Popover';

import Picker from './Picker';

const SWATCH_BUTTON = 'size-8 rounded-sm border border-cadet-400 inline-flex items-center justify-center bg-white';

type Props =
  | {
      nullable: true;
      label: string;
      onChange: (value: string | null) => void;
      defaultValue: string | null;
    }
  | {
      nullable: false;
      label: string;
      onChange: (value: string) => void;
      defaultValue: string;
    };
export default function ColorInput({ label, defaultValue, onChange, nullable }: Props) {
  const t = useTranslate();
  const [value, setValue] = useState(defaultValue);

  const renderResetButton = () => {
    if (!nullable) {
      return null;
    }
    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }
    return (
      <button
        type="button"
        aria-label={t('input.clear', { label })}
        onClick={() => {
          setValue(null);
          onChange(null);
        }}
      >
        <X className="size-5 text-grey-600" />
      </button>
    );
  };

  const openButton = value ? (
    <button type="button" aria-label={label} className={SWATCH_BUTTON} style={{ backgroundColor: value }} />
  ) : (
    <button type="button" aria-label={label} className={SWATCH_BUTTON}>
      <Plus className="size-5" />
    </button>
  );

  return (
    <div className="flex flex-col items-start gap-1">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <Popover trigger={openButton} align="start">
          <Picker
            value={value || ''}
            onChange={(v) => {
              setValue(v);
              onChange(v);
            }}
          />
        </Popover>
        {renderResetButton()}
      </div>
    </div>
  );
}
