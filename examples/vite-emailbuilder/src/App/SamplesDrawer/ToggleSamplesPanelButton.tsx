import { ChevronFirst, Menu } from 'lucide-react';
import React from 'react';

import { toggleSamplesDrawerOpen, useSamplesDrawerOpen } from '../../documents/editor/EditorContext';
import IconButton from '../../ui/IconButton';

function useIcon() {
  const samplesDrawerOpen = useSamplesDrawerOpen();
  if (samplesDrawerOpen) {
    return <ChevronFirst className="size-5" />;
  }
  return <Menu className="size-5" />;
}

export default function ToggleSamplesPanelButton() {
  const icon = useIcon();
  return (
    <IconButton onClick={toggleSamplesDrawerOpen} aria-label="Toggle samples panel">
      {icon}
    </IconButton>
  );
}
