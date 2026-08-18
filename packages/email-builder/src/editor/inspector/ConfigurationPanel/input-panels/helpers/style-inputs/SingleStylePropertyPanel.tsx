import { SquareRoundCorner } from 'lucide-react';
import React from 'react';

import { TStyle } from '../../../../../helpers/TStyle';
import { useTranslate } from '../../../../../i18n';
import { NullableColorInput } from '../inputs/ColorInput';
import { NullableFontFamily } from '../inputs/FontFamily';
import FontSizeInput from '../inputs/FontSizeInput';
import FontWeightInput from '../inputs/FontWeightInput';
import PaddingInput from '../inputs/PaddingInput';
import SliderInput from '../inputs/SliderInput';
import TextAlignInput from '../inputs/TextAlignInput';

type StylePropertyPanelProps = {
  name: keyof TStyle;
  value: TStyle;
  onChange: (style: TStyle) => void;
};
export default function SingleStylePropertyPanel({ name, value, onChange }: StylePropertyPanelProps) {
  const t = useTranslate();
  const defaultValue = value[name] ?? null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (v: any) => {
    onChange({ ...value, [name]: v });
  };

  switch (name) {
    case 'backgroundColor':
      return (
        <NullableColorInput label={t('field.backgroundColor')} defaultValue={defaultValue} onChange={handleChange} />
      );
    case 'borderColor':
      return <NullableColorInput label={t('field.borderColor')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'borderWidth':
      // The same four-sided control as padding, over a much smaller range.
      return (
        <PaddingInput
          label={t('field.borderWidth')}
          defaultValue={defaultValue}
          onChange={handleChange}
          min={0}
          max={16}
          step={1}
        />
      );
    case 'borderRadius':
      return (
        <SliderInput
          iconLabel={<SquareRoundCorner className="size-4" />}
          units="px"
          step={4}
          marks
          min={0}
          max={48}
          label={t('field.borderRadius')}
          defaultValue={defaultValue}
          onChange={handleChange}
        />
      );
    case 'color':
      return <NullableColorInput label={t('field.textColor')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontFamily':
      return <NullableFontFamily label={t('field.fontFamily')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontSize':
      return <FontSizeInput label={t('field.fontSize')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'fontWeight':
      return <FontWeightInput label={t('field.fontWeight')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'textAlign':
      return <TextAlignInput label={t('field.alignment')} defaultValue={defaultValue} onChange={handleChange} />;
    case 'padding':
      return <PaddingInput label={t('field.padding')} defaultValue={defaultValue} onChange={handleChange} />;
  }
}
