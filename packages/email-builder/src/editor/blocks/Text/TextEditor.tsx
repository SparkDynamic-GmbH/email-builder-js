import React from 'react';

import { Text, TextProps, TextPropsDefaults } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions } from '../../EditorContext';
import InlineEditable from '../../helpers/InlineEditable';

/**
 * Inline editing is disabled in markdown mode: the canvas shows rendered HTML there, so what the
 * user would be typing into is not the string we store. Rich text has no such gap — the marks the
 * toolbar applies are read back out of the same DOM they were applied to.
 */
export default function TextEditor(props: TextProps) {
  const { setDocument } = useEditorActions();
  const blockId = useCurrentBlockId();
  const format = props.props?.format ?? TextPropsDefaults.format;
  return (
    <InlineEditable
      multiline
      rich={format === 'html'}
      disabled={format === 'markdown'}
      value={props.props?.text ?? ''}
      onChange={(text) =>
        setDocument({ [blockId]: { type: 'Text', data: { ...props, props: { ...props.props, text } } } })
      }
    >
      <Text {...props} />
    </InlineEditable>
  );
}
