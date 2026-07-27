import React, { useState } from 'react';
import { ZodError } from 'zod';

import { CardProps, CardPropsDefaults, CardPropsSchema } from '../../../../exports/blocks';
import { useTranslate } from '../../../i18n';
import { ImagePickerButton, TImageLibraryItem, useImageLibrary } from '../../../imageLibrary';
import { ToggleButton } from '../../../ui/ToggleGroup';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import ColorInput from './helpers/inputs/ColorInput';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type CardSidebarPanelProps = {
  data: CardProps;
  setData: (v: CardProps) => void;
};
export default function CardSidebarPanel({ data, setData }: CardSidebarPanelProps) {
  const t = useTranslate();
  const imageLibrary = useImageLibrary();
  const [, setErrors] = useState<ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = CardPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  // The library's alt text fills a blank one, never replaces what was typed.
  const applyLibraryItem = ({ url, alt }: TImageLibraryItem) => {
    const hasAlt = (data.props?.imageAlt ?? '').trim().length > 0;
    updateData({ ...data, props: { ...data.props, imageUrl: url, ...(!hasAlt && alt ? { imageAlt: alt } : {}) } });
  };

  const imageUrl = data.props?.imageUrl ?? '';
  const imageAlt = data.props?.imageAlt ?? CardPropsDefaults.imageAlt;
  const imagePosition = data.props?.imagePosition ?? CardPropsDefaults.imagePosition;
  const heading = data.props?.heading ?? CardPropsDefaults.heading;
  const body = data.props?.body ?? CardPropsDefaults.body;
  const buttonText = data.props?.buttonText ?? CardPropsDefaults.buttonText;
  const buttonUrl = data.props?.buttonUrl ?? CardPropsDefaults.buttonUrl;
  const buttonBackgroundColor = data.props?.buttonBackgroundColor ?? CardPropsDefaults.buttonBackgroundColor;
  const buttonTextColor = data.props?.buttonTextColor ?? CardPropsDefaults.buttonTextColor;

  return (
    <BaseSidebarPanel title={t('panel.Card')}>
      <TextInput
        label={t('field.imageUrl')}
        defaultValue={imageUrl}
        onChange={(imageUrl) => updateData({ ...data, props: { ...data.props, imageUrl } })}
      />
      {imageLibrary && (
        <ImagePickerButton library={imageLibrary} currentUrl={imageUrl || null} onSelect={applyLibraryItem} />
      )}
      <TextInput
        label={t('field.altText')}
        defaultValue={imageAlt}
        onChange={(imageAlt) => updateData({ ...data, props: { ...data.props, imageAlt } })}
      />
      <RadioGroupInput
        label={t('field.imagePosition')}
        defaultValue={imagePosition}
        onChange={(imagePosition) => updateData({ ...data, props: { ...data.props, imagePosition } })}
      >
        <ToggleButton value="top">{t('option.imagePosition.top')}</ToggleButton>
        <ToggleButton value="left">{t('option.imagePosition.left')}</ToggleButton>
        <ToggleButton value="right">{t('option.imagePosition.right')}</ToggleButton>
      </RadioGroupInput>
      <TextInput
        label={t('field.heading')}
        defaultValue={heading}
        onChange={(heading) => updateData({ ...data, props: { ...data.props, heading } })}
      />
      <TextInput
        label={t('field.body')}
        rows={3}
        defaultValue={body}
        onChange={(body) => updateData({ ...data, props: { ...data.props, body } })}
      />
      <TextInput
        label={t('field.buttonText')}
        defaultValue={buttonText}
        onChange={(buttonText) => updateData({ ...data, props: { ...data.props, buttonText } })}
      />
      <TextInput
        label={t('field.buttonUrl')}
        defaultValue={buttonUrl}
        onChange={(buttonUrl) => updateData({ ...data, props: { ...data.props, buttonUrl } })}
      />
      <ColorInput
        label={t('field.buttonColor')}
        defaultValue={buttonBackgroundColor}
        onChange={(buttonBackgroundColor) => updateData({ ...data, props: { ...data.props, buttonBackgroundColor } })}
      />
      <ColorInput
        label={t('field.textColor')}
        defaultValue={buttonTextColor}
        onChange={(buttonTextColor) => updateData({ ...data, props: { ...data.props, buttonTextColor } })}
      />
      <MultiStylePropertyPanel
        names={['backgroundColor', 'borderColor', 'borderRadius', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
