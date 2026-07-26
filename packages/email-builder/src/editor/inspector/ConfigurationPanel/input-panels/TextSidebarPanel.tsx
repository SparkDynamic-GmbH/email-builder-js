import React, { useState } from 'react';
import { ZodError } from 'zod';

import { TextProps, TextPropsDefaults, TextPropsSchema } from '../../../../exports/blocks';
import convertTextFormat, { TTextFormat } from '../../../helpers/richText/convert';
import { useTranslate } from '../../../i18n';
import { ToggleButton } from '../../../ui/ToggleGroup';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TextSidebarPanelProps = {
  data: TextProps;
  setData: (v: TextProps) => void;
};
export default function TextSidebarPanel({ data, setData }: TextSidebarPanelProps) {
  const t = useTranslate();
  const [, setErrors] = useState<ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = TextPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const format = data.props?.format ?? TextPropsDefaults.format;

  return (
    <BaseSidebarPanel title={t('panel.Text')}>
      {/* Rich text is edited on the canvas, where the marks are visible. Showing the stored
          markup here would invite hand-editing into something the sanitizer then rewrites. */}
      {format !== 'html' && (
        <TextInput
          label={t('field.content')}
          rows={5}
          defaultValue={data.props?.text ?? ''}
          onChange={(text) => updateData({ ...data, props: { ...data.props, text } })}
        />
      )}
      <RadioGroupInput
        label={t('field.format')}
        defaultValue={format}
        onChange={(value) => {
          const next = value as TTextFormat;
          const text = convertTextFormat(data.props?.text ?? '', format, next);
          updateData({ ...data, props: { ...data.props, format: next, text } });
        }}
      >
        <ToggleButton value="plain">{t('option.format.plain')}</ToggleButton>
        <ToggleButton value="html">{t('option.format.html')}</ToggleButton>
        <ToggleButton value="markdown">{t('option.format.markdown')}</ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'fontWeight', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
