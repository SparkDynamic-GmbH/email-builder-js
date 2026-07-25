import { ChevronLast, PanelRight } from 'lucide-react';
import React from 'react';

import { toggleInspectorDrawerOpen, useInspectorDrawerOpen } from '../../documents/editor/EditorContext';
import IconButton from '../../ui/IconButton';

export default function ToggleInspectorPanelButton() {
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const handleClick = () => {
    toggleInspectorDrawerOpen();
  };
  const icon = inspectorDrawerOpen ? <ChevronLast className="size-5" /> : <PanelRight className="size-5" />;
  return (
    <IconButton onClick={handleClick} aria-label="Toggle inspector panel">
      {icon}
    </IconButton>
  );
}
