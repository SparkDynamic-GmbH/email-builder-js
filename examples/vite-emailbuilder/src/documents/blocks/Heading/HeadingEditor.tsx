import React from 'react';

import { Heading, HeadingProps } from '@sparkdynamic/email-builder';

import { useCurrentBlockId } from '../../editor/EditorBlock';
import { useEditorActions } from '../../editor/EditorContext';
import InlineEditable from '../helpers/InlineEditable';

export default function HeadingEditor(props: HeadingProps) {
  const { setDocument } = useEditorActions();
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
