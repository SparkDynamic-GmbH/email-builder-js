import React, { useMemo } from 'react';

import { useDocument } from '@sparkdynamic/email-builder/editor';

import { renderToStaticMarkup, TEditorConfiguration } from '../../registry';

import HighlightedCodePanel from './helper/HighlightedCodePanel';

export default function HtmlPanel() {
  // The editor works over any block set; this app knows it registered its own.
  const document = useDocument() as TEditorConfiguration;
  const code = useMemo(() => renderToStaticMarkup(document, { rootBlockId: 'root' }), [document]);
  return <HighlightedCodePanel type="html" value={code} />;
}
