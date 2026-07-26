import { AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart } from 'lucide-react';
import React, { useState } from 'react';
import { ZodError } from 'zod';

import { ImageProps, ImagePropsSchema } from '../../../../exports/blocks';
import { useTranslate } from '../../../i18n';
import { ImagePickerButton, TImageLibraryItem, useImageLibrary } from '../../../imageLibrary';
import { ToggleButton } from '../../../ui/ToggleGroup';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import RadioGroupInput from './helpers/inputs/RadioGroupInput';
import TextDimensionInput from './helpers/inputs/TextDimensionInput';
import TextInput from './helpers/inputs/TextInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type ImageSidebarPanelProps = {
  data: ImageProps;
  setData: (v: ImageProps) => void;
};
export default function ImageSidebarPanel({ data, setData }: ImageSidebarPanelProps) {
  const t = useTranslate();
  const imageLibrary = useImageLibrary();
  const [, setErrors] = useState<ZodError | null>(null);

  const updateData = (d: unknown) => {
    const res = ImagePropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  // The library's alt text fills a blank one, never replaces what was typed.
  // Dimensions are deliberately left alone: the asset's intrinsic size is
  // rarely the size it should render at in an email.
  const applyLibraryItem = ({ url, alt }: TImageLibraryItem) => {
    const hasAlt = (data.props?.alt ?? '').trim().length > 0;
    updateData({ ...data, props: { ...data.props, url, ...(!hasAlt && alt ? { alt } : {}) } });
  };

  return (
    <BaseSidebarPanel title={t('panel.Image')}>
      <TextInput
        label={t('field.sourceUrl')}
        defaultValue={data.props?.url ?? ''}
        onChange={(v) => {
          const url = v.trim().length === 0 ? null : v.trim();
          updateData({ ...data, props: { ...data.props, url } });
        }}
      />
      {imageLibrary && (
        <ImagePickerButton library={imageLibrary} currentUrl={data.props?.url ?? null} onSelect={applyLibraryItem} />
      )}

      <TextInput
        label={t('field.altText')}
        defaultValue={data.props?.alt ?? ''}
        onChange={(alt) => updateData({ ...data, props: { ...data.props, alt } })}
      />
      <TextInput
        label={t('field.clickThroughUrl')}
        defaultValue={data.props?.linkHref ?? ''}
        onChange={(v) => {
          const linkHref = v.trim().length === 0 ? null : v.trim();
          updateData({ ...data, props: { ...data.props, linkHref } });
        }}
      />
      <div className="flex gap-4">
        <TextDimensionInput
          label={t('field.width')}
          defaultValue={data.props?.width}
          onChange={(width) => updateData({ ...data, props: { ...data.props, width } })}
        />
        <TextDimensionInput
          label={t('field.height')}
          defaultValue={data.props?.height}
          onChange={(height) => updateData({ ...data, props: { ...data.props, height } })}
        />
      </div>

      <RadioGroupInput
        label={t('field.alignment')}
        defaultValue={data.props?.contentAlignment ?? 'middle'}
        onChange={(contentAlignment) => updateData({ ...data, props: { ...data.props, contentAlignment } })}
      >
        <ToggleButton value="top" tooltip={t('option.align.top')}>
          <AlignVerticalJustifyStart className="size-5" />
        </ToggleButton>
        <ToggleButton value="middle" tooltip={t('option.align.middle')}>
          <AlignVerticalJustifyCenter className="size-5" />
        </ToggleButton>
        <ToggleButton value="bottom" tooltip={t('option.align.bottom')}>
          <AlignVerticalJustifyEnd className="size-5" />
        </ToggleButton>
      </RadioGroupInput>

      <MultiStylePropertyPanel
        names={['backgroundColor', 'textAlign', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
