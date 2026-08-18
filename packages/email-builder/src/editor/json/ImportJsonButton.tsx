import { Upload } from 'lucide-react';
import React, { useState } from 'react';

import { useTranslate } from '../i18n';
import IconButton from '../ui/IconButton';
import Tooltip from '../ui/Tooltip';

import ImportJsonDialog from './ImportJsonDialog';

type Props = {
  /** Called with the imported document once it has replaced the current one. */
  onImport?: React.ComponentProps<typeof ImportJsonDialog>['onImport'];
};

/** Host chrome, like `SaveButton`: put it in your toolbar. */
export default function ImportJsonButton({ onImport }: Props) {
  const t = useTranslate();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title={t('json.import')}>
        <IconButton onClick={() => setOpen(true)} aria-label={t('json.import')}>
          <Upload className="size-5" />
        </IconButton>
      </Tooltip>
      {open && <ImportJsonDialog onClose={() => setOpen(false)} onImport={onImport} />}
    </>
  );
}
