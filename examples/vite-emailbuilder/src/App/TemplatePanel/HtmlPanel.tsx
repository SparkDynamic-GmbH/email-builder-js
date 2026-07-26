import React, { useMemo } from 'react';

import { renderToStaticMarkup, TEditorConfiguration } from '../../documents/editor/core';
import { useDocument } from '../../documents/editor/EditorContext';

import HighlightedCodePanel from './helper/HighlightedCodePanel';

export default function HtmlPanel() {
  // The editor works over any block set; this app knows it registered its own.
  const document = useDocument() as TEditorConfiguration;
  const code = useMemo(() => renderToStaticMarkup(document, { rootBlockId: 'root' }), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}
