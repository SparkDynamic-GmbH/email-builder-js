import { Download } from 'lucide-react';
import React, { useMemo } from 'react';

import { IconLinkButton, Tooltip, useDocument } from '@sparkdynamic/email-builder/editor';

export default function DownloadJson() {
  const doc = useDocument();
  const href = useMemo(() => {
    return `data:text/plain,${encodeURIComponent(JSON.stringify(doc, null, '  '))}`;
  }, [doc]);
  return (
    <Tooltip title="Download JSON file">
      <IconLinkButton href={href} download="emailTemplate.json" aria-label="Download JSON file">
        <Download className="size-5" />
      </IconLinkButton>
    </Tooltip>
  );
}
