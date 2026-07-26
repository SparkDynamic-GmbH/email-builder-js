import { Share } from 'lucide-react';
import React, { useState } from 'react';

import { IconButton, Toast, Tooltip, useDocument } from '@sparkdynamic/email-builder/editor';

export default function ShareButton() {
  const document = useDocument();
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    const c = encodeURIComponent(JSON.stringify(document));
    location.hash = `#code/${btoa(c)}`;
    setMessage('The URL was updated. Copy it to share your current template.');
  };

  const onClose = () => {
    setMessage(null);
  };

  return (
    <>
      <Tooltip title="Share current template">
        <IconButton onClick={onClick} aria-label="Share current template">
          <Share className="size-5" />
        </IconButton>
      </Tooltip>
      <Toast message={message} onClose={onClose} />
    </>
  );
}
