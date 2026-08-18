import React, { useState } from 'react';
import type { ZodError } from 'zod';

import { ContainerProps, ContainerPropsSchema } from '../../../../blocks/Container/ContainerPropsSchema';
import { TStyle } from '../../../helpers/TStyle';
import { useTranslate } from '../../../i18n';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type ContainerSidebarPanelProps = {
  data: ContainerProps;
  setData: (v: ContainerProps) => void;
};

export default function ContainerSidebarPanel({ data, setData }: ContainerSidebarPanelProps) {
  const t = useTranslate();
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = ContainerPropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };
  // Widths draw nothing without a colour, so they follow it rather than preceding it.
  const names: (keyof TStyle)[] = [
    'backgroundColor',
    'borderColor',
    ...(data.style?.borderColor ? (['borderWidth'] as const) : []),
    'borderRadius',
    'padding',
  ];

  return (
    <BaseSidebarPanel title={t('panel.Container')}>
      <MultiStylePropertyPanel names={names} value={data.style} onChange={(style) => updateData({ ...data, style })} />
    </BaseSidebarPanel>
  );
}
