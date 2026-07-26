import React from 'react';

import { Heading, HeadingProps } from '@usewaypoint/email-builder';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { setDocument } from '../../editor/EditorContext';
import InlineEditable from '../helpers/InlineEditable';

export default function HeadingEditor(props: HeadingProps) {
  const blockId = useCurrentBlockId();
  return (
    <InlineEditable
      value={props.props?.text ?? ''}
      onChange={(text) =>
        setDocument({ [blockId]: { type: 'Heading', data: { ...props, props: { ...props.props, text } } } })
      }
    >
      <Heading {...props} />
    </InlineEditable>
  );
}
