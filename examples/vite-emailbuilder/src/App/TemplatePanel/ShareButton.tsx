import { Share } from 'lucide-react';
import React, { useState } from 'react';

import { IconButton, Toast, Tooltip, useDocument, useTranslate } from '@sparkdynamic/email-builder/editor';

export default function ShareButton() {
  const t = useTranslate();
  const document = useDocument();
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    const c = encodeURIComponent(JSON.stringify(document));
    location.hash = `#code/${btoa(c)}`;
    setMessage(t('app.share.toast'));
  };

  const onClose = () => {
    setMessage(null);
  };

  return (
    <>
      <Tooltip title={t('app.share')}>
        <IconButton onClick={onClick} aria-label={t('app.share')}>
          <Share className="size-5" />
        </IconButton>
      </Tooltip>
      <Toast message={message} onClose={onClose} />
    </>
  );
}
