import React from 'react';

import { Text, TextProps } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions } from '../../EditorContext';
import InlineEditable from '../../helpers/InlineEditable';

/**
 * Every Text block is rich, so the selection toolbar is always a drag away and there is no mode to
 * discover first. The marks are read back out of the same DOM they were applied to.
 */
export default function TextEditor(props: TextProps) {
  const { setDocument } = useEditorActions();
  const blockId = useCurrentBlockId();
  return (
    <InlineEditable
      multiline
      rich
      value={props.props?.text ?? ''}
      onChange={(text) =>
        setDocument({ [blockId]: { type: 'Text', data: { ...props, props: { ...props.props, text } } } })
      }
    >
      <Text {...props} />
    </InlineEditable>
  );
}
