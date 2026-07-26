import { MoveHorizontal, Square } from 'lucide-react';
import React, { useState } from 'react';
import { ZodError } from 'zod';

import { TableProps, TablePropsDefaults, TablePropsSchema } from '../../../../exports/blocks';
import { useTranslate } from '../../../i18n';

import BaseSidebarPanel from './helpers/BaseSidebarPanel';
import BooleanInput from './helpers/inputs/BooleanInput';
import ColorInput, { NullableColorInput } from './helpers/inputs/ColorInput';
import SliderInput from './helpers/inputs/SliderInput';
import TextAlignInput from './helpers/inputs/TextAlignInput';
import MultiStylePropertyPanel from './helpers/style-inputs/MultiStylePropertyPanel';

type TableSidebarPanelProps = {
  data: TableProps;
  setData: (v: TableProps) => void;
};

/** Cell text is edited on the canvas, so this panel is styling and structure only. */
export default function TableSidebarPanel({ data, setData }: TableSidebarPanelProps) {
  const t = useTranslate();
  const [, setErrors] = useState<ZodError | null>(null);
  const updateData = (d: unknown) => {
    const res = TablePropsSchema.safeParse(d);
    if (res.success) {
      setData(res.data);
      setErrors(null);
    } else {
      setErrors(res.error);
    }
  };
  const updateProps = (props: Partial<NonNullable<TableProps['props']>>) =>
    updateData({ ...data, props: { ...data.props, ...props } });

  const headerRow = data.props?.headerRow ?? TablePropsDefaults.headerRow;
  const columnAlignments = data.props?.columnAlignments ?? [];
  const columnCount = (data.props?.rows ?? []).reduce((max, row) => Math.max(max, row.length), 0);

  return (
    <BaseSidebarPanel title={t('panel.Table')}>
      <BooleanInput
        label={t('field.headerRow')}
        defaultValue={headerRow}
        onChange={(headerRow) => updateProps({ headerRow })}
      />
      {headerRow && (
        <>
          <NullableColorInput
            label={t('field.headerBackgroundColor')}
            defaultValue={data.props?.headerBackgroundColor ?? TablePropsDefaults.headerBackgroundColor}
            onChange={(headerBackgroundColor) => updateProps({ headerBackgroundColor })}
          />
          <NullableColorInput
            label={t('field.headerTextColor')}
            defaultValue={data.props?.headerTextColor ?? null}
            onChange={(headerTextColor) => updateProps({ headerTextColor })}
          />
        </>
      )}
      <NullableColorInput
        label={t('field.stripedRowColor')}
        defaultValue={data.props?.stripedRowColor ?? null}
        onChange={(stripedRowColor) => updateProps({ stripedRowColor })}
      />
      <ColorInput
        label={t('field.borderColor')}
        defaultValue={data.props?.borderColor ?? TablePropsDefaults.borderColor}
        onChange={(borderColor) => updateProps({ borderColor })}
      />
      <SliderInput
        label={t('field.borderWidth')}
        iconLabel={<Square className="size-4 text-txt-secondary" />}
        units="px"
        step={1}
        min={0}
        max={8}
        defaultValue={data.props?.borderWidth ?? TablePropsDefaults.borderWidth}
        onChange={(borderWidth) => updateProps({ borderWidth })}
      />
      <SliderInput
        label={t('field.cellPadding')}
        iconLabel={<MoveHorizontal className="size-4 text-txt-secondary" />}
        units="px"
        step={2}
        min={0}
        max={32}
        defaultValue={data.props?.cellPadding ?? TablePropsDefaults.cellPadding}
        onChange={(cellPadding) => updateProps({ cellPadding })}
      />
      {Array.from({ length: columnCount }, (_, index) => (
        <TextAlignInput
          key={`${columnCount}-${index}`}
          label={t('field.column', { number: index + 1 })}
          defaultValue={columnAlignments[index] ?? 'left'}
          onChange={(value) => {
            const next = Array.from({ length: columnCount }, (_, i) => columnAlignments[i] ?? 'left');
            next[index] = (value ?? 'left') as (typeof next)[number];
            updateProps({ columnAlignments: next });
          }}
        />
      ))}
      <MultiStylePropertyPanel
        names={['color', 'backgroundColor', 'fontFamily', 'fontSize', 'padding']}
        value={data.style}
        onChange={(style) => updateData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
