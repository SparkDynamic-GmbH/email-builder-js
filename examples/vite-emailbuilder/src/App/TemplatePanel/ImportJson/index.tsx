import { Upload } from 'lucide-react';
import React, { useState } from 'react';

import { IconButton, Tooltip, useTranslate } from '@sparkdynamic/email-builder/editor';

import ImportJsonDialog from './ImportJsonDialog';

export default function ImportJson() {
  const t = useTranslate();
  const [open, setOpen] = useState(false);

  let dialog = null;
  if (open) {
    dialog = <ImportJsonDialog onClose={() => setOpen(false)} />;
  }

  return (
    <>
      <Tooltip title={t('app.import')}>
        <IconButton onClick={() => setOpen(true)} aria-label={t('app.import')}>
          <Upload className="size-5" />
        </IconButton>
      </Tooltip>
      {dialog}
    </>
  );
}
