import React from 'react';

import { useEditorActions, useInspectorDrawerOpen, useSelectedSidebarTab } from '../../documents/editor/EditorContext';
import Drawer from '../../ui/Drawer';
import Tabs, { Tab } from '../../ui/Tabs';

import ConfigurationPanel from './ConfigurationPanel';
import StylesPanel from './StylesPanel';

export const INSPECTOR_DRAWER_WIDTH = 320;

export default function InspectorDrawer() {
  const { setSidebarTab } = useEditorActions();
  const selectedSidebarTab = useSelectedSidebarTab();
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  const renderCurrentSidebarPanel = () => {
    switch (selectedSidebarTab) {
      case 'block-configuration':
        return <ConfigurationPanel />;
      case 'styles':
        return <StylesPanel />;
    }
  };

  return (
    <Drawer anchor="right" open={inspectorDrawerOpen} width={INSPECTOR_DRAWER_WIDTH}>
      <div className="h-[49px] border-b border-divider px-4">
        <Tabs value={selectedSidebarTab} onValueChange={setSidebarTab} className="h-full">
          <Tab value="styles">Styles</Tab>
          <Tab value="block-configuration">Inspect</Tab>
        </Tabs>
      </div>
      <div className="h-[calc(100%-49px)] overflow-auto">{renderCurrentSidebarPanel()}</div>
    </Drawer>
  );
}
