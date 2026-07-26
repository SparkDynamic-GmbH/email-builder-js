import { ChevronFirst, Menu } from 'lucide-react';
import React from 'react';

import { IconButton, useTranslate } from '@sparkdynamic/email-builder/editor';

type Props = { open: boolean; onToggle: () => void };

export default function ToggleSamplesPanelButton({ open, onToggle }: Props) {
  const t = useTranslate();
  const icon = open ? <ChevronFirst className="size-5" /> : <Menu className="size-5" />;

  return (
    <IconButton onClick={onToggle} aria-label={t('app.samples.toggle')}>
      {icon}
    </IconButton>
  );
}
