import React from 'react';

import { Text, TextProps } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions } from '../../EditorContext';
import InlineEditable from '../../helpers/InlineEditable';

/**
 * Inline editing is disabled in markdown mode: the canvas shows rendered HTML there, so what the
 * user would be typing into is not the string we store.
 */
export default function TextEditor(props: TextProps) {
  const { setDocument } = useEditorActions();
  const blockId = useCurrentBlockId();
  return (
    <InlineEditable
      multiline
      disabled={props.props?.markdown ?? false}
      value={props.props?.text ?? ''}
      onChange={(text) =>
        setDocument({ [blockId]: { type: 'Text', data: { ...props, props: { ...props.props, text } } } })
      }
    >
      <Text {...props} />
    </InlineEditable>
  );
}
