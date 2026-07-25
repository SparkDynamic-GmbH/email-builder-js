import React from 'react';

import { Button, ButtonProps } from '@usewaypoint/block-button';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument } from '../../editor/EditorContext';
import InlineEditable from '../helpers/InlineEditable';

export default function ButtonEditor(props: ButtonProps) {
  const blockId = useCurrentBlockId();
  return (
    <InlineEditable
      value={props.props?.text ?? ''}
      onChange={(text) =>
        setDocument({ [blockId]: { type: 'Button', data: { ...props, props: { ...props.props, text } } } })
      }
    >
      <Button {...props} />
    </InlineEditable>
  );
}
