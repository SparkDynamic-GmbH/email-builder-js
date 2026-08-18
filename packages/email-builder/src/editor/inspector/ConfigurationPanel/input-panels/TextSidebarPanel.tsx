import React, { useState } from 'react';
import { ZodError } from 'zod';

import { TextProps, TextPropsSchema } from '../../../../exports/blocks';
import { TStyle } from '../../../helpers/TStyle';
import { useTranslate } from '../../../i18n';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TextSidebarPanelProps = {
  data: TextProps;
  setData: (v: TextProps) => void;
};

/**
 * No content field: the text carries inline marks now, and a textarea could only show them as raw
 * markup and let them be hand-edited into something the sanitizer then rewrites. The canvas is
 * where a Text block is written — this panel owns how the block as a whole looks.
 */
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

  // The background's own inset only means anything once the background has stopped filling the
  // block, so it appears with the switch rather than sitting inert above it.
  const names: (keyof TStyle)[] = [
    'color',
    'backgroundColor',
    'inlineBackground',
    ...(data.style?.inlineBackground ? (['backgroundPadding'] as const) : []),
    'fontFamily',
    'fontSize',
    'fontWeight',
    'textAlign',
    'padding',
  ];

  return (
    <BaseSidebarPanel title={t('panel.Text')}>
      <MultiStylePropertyPanel names={names} value={data.style} onChange={(style) => updateData({ ...data, style })} />
    </BaseSidebarPanel>
  );
}
