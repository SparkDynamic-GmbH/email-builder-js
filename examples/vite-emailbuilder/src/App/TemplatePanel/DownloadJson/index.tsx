import { Download } from 'lucide-react';
import React, { useMemo } from 'react';

import { IconLinkButton, Tooltip, useDocument, useTranslate } from '@sparkdynamic/email-builder/editor';

export default function DownloadJson() {
  const t = useTranslate();
  const doc = useDocument();
  const href = useMemo(() => {
    return `data:text/plain,${encodeURIComponent(JSON.stringify(doc, null, '  '))}`;
  }, [doc]);
  return (
    <Tooltip title={t('app.download')}>
      <IconLinkButton href={href} download="emailTemplate.json" aria-label={t('app.download')}>
        <Download className="size-5" />
      </IconLinkButton>
    </Tooltip>
  );
}
