import { MoveVertical } from 'lucide-react';
import React, { useState } from 'react';
import { ZodError } from 'zod';

import { DividerProps, DividerPropsDefaults, DividerPropsSchema } from '../../../../exports/blocks';
import { useTranslate } from '../../../i18n';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import ColorInput from './helpers/inputs/ColorInput';
import SliderInput from './helpers/inputs/SliderInput';
import TextAlignInput from './helpers/inputs/TextAlignInput';
import TextDimensionInput from './helpers/inputs/TextDimensionInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type DividerSidebarPanelProps = {
  data: DividerProps;
  setData: (v: DividerProps) => void;
};
export default function DividerSidebarPanel({ data, setData }: DividerSidebarPanelProps) {
  const t = useTranslate();
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = DividerPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };

  const lineColor = data.props?.lineColor ?? DividerPropsDefaults.lineColor;
  const lineHeight = data.props?.lineHeight ?? DividerPropsDefaults.lineHeight;
  const lineWidth = data.props?.lineWidth ?? DividerPropsDefaults.lineWidth;

  return (
    <BaseSidebarPanel title={t('panel.Divider')}>
      <ColorInput
        label={t('field.color')}
        defaultValue={lineColor}
        onChange={(lineColor) => updateData({ ...data, props: { ...data.props, lineColor } })}
      />
      <SliderInput
        label={t('field.height')}
        iconLabel={<MoveVertical className="size-4 text-txt-secondary" />}
        units="px"
        step={1}
        min={1}
        max={24}
        defaultValue={lineHeight}
        onChange={(lineHeight) => updateData({ ...data, props: { ...data.props, lineHeight } })}
      />
      <TextDimensionInput
        label={t('field.width')}
        defaultValue={lineWidth}
        onChange={(lineWidth) => updateData({ ...data, props: { ...data.props, lineWidth } })}
      />
      {/* A full-width rule has nowhere to be aligned to, so the control only appears with a width. */}
      {lineWidth === null ? null : (
        <TextAlignInput
          label={t('field.alignment')}
          defaultValue={data.props?.align ?? DividerPropsDefaults.align}
          onChange={(align) => updateData({ ...data, props: { ...data.props, align } })}
        />
      )}
      <MultiStylePropertyPanel
        names={['backgroundColor', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
