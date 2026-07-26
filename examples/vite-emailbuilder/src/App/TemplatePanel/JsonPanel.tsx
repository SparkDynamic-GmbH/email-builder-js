import React, { useMemo } from 'react';

import { useDocument } from '@sparkdynamic/email-builder/editor';

import HighlightedCodePanel from './helper/HighlightedCodePanel';

export default function JsonPanel() {
  const document = useDocument();
  const code = useMemo(() => JSON.stringify(document, null, '  '), [document]);
  return <HighlightedCodePanel type="json" value={code} />;
}
