import React from 'react';

import { ReaderBlock } from '../../Reader/ReaderBlock';

import { Container as BaseContainer } from '.';
import { ContainerProps } from './ContainerPropsSchema';

export default function ContainerReader({ style, props }: ContainerProps) {
  const childrenIds = props?.childrenIds ?? [];
  return (
    <BaseContainer style={style}>
      {childrenIds.map((childId) => (
        <ReaderBlock key={childId} id={childId} />
      ))}
    </BaseContainer>
  );
}
