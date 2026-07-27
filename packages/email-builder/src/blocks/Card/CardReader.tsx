import React from 'react';

import { ReaderBlock } from '../../Reader/ReaderBlock';

import { Card as BaseCard, CardProps } from '.';

export default function CardReader({ style, props }: CardProps) {
  const childrenIds = props?.childrenIds ?? [];
  return (
    <BaseCard style={style} props={props}>
      {childrenIds.map((childId) => (
        <ReaderBlock key={childId} id={childId} />
      ))}
    </BaseCard>
  );
}
