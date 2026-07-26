import { Upload } from 'lucide-react';
import React, { useState } from 'react';

import { IconButton, Tooltip } from '@sparkdynamic/email-builder/editor';

import ImportJsonDialog from './ImportJsonDialog';

export default function ImportJson() {
  const [open, setOpen] = useState(false);

  let dialog = null;
  if (open) {
    dialog = <ImportJsonDialog onClose={() => setOpen(false)} />;
  }

  return (
    <>
      <Tooltip title="Import JSON">
        <IconButton onClick={() => setOpen(true)} aria-label="Import JSON">
          <Upload className="size-5" />
        </IconButton>
      </Tooltip>
      {dialog}
    </>
  );
}
