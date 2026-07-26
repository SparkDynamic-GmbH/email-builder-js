import React from 'react';

import { ReaderBlock } from '../../Reader/ReaderBlock';

import { ColumnsContainer as BaseColumnsContainer } from '.';
import { ColumnsContainerProps } from './ColumnsContainerPropsSchema';

export default function ColumnsContainerReader({ style, props }: ColumnsContainerProps) {
  const { columns, ...restProps } = props ?? {};
  let cols = undefined;
  if (columns) {
    cols = columns.map((col) => col.childrenIds.map((childId) => <ReaderBlock key={childId} id={childId} />));
  }

  return <BaseColumnsContainer props={restProps} columns={cols} style={style} />;
}
