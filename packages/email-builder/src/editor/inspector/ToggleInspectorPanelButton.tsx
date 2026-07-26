import { ChevronLast, PanelRight } from 'lucide-react';
import React from 'react';

import { useEditorActions, useInspectorDrawerOpen } from '../EditorContext';
import { useTranslate } from '../i18n';
import IconButton from '../ui/IconButton';

export default function ToggleInspectorPanelButton() {
  const t = useTranslate();
  const { toggleInspectorDrawerOpen } = useEditorActions();
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const handleClick = () => {
    toggleInspectorDrawerOpen();
  };
  const icon = inspectorDrawerOpen ? <ChevronLast className="size-5" /> : <PanelRight className="size-5" />;
  return (
    <IconButton onClick={handleClick} aria-label={t('inspector.toggle')}>
      {icon}
    </IconButton>
  );
}
