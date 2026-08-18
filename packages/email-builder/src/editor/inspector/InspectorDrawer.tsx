import React from 'react';

import { useEditorActions, useInspectorDrawerOpen, useSelectedSidebarTab } from '../EditorContext';
import { useTranslate } from '../i18n';
import { TemplateLibraryPanel, useTemplateLibrary } from '../templateLibrary';
import Drawer from '../ui/Drawer';
import Tabs, { Tab } from '../ui/Tabs';

import ConfigurationPanel from './ConfigurationPanel';
import StylesPanel from './StylesPanel';

export const INSPECTOR_DRAWER_WIDTH = 320;

export default function InspectorDrawer() {
  const t = useTranslate();
  const { setSidebarTab } = useEditorActions();
  const inspectorDrawerOpen = useInspectorDrawerOpen();
  // The tab only exists when the host gave the provider a library; a selection
  // left pointing at it after the library goes away falls back to Styles.
  const hasTemplates = useTemplateLibrary() !== null;
  const selected = useSelectedSidebarTab();
  const selectedSidebarTab = selected === 'templates' && !hasTemplates ? 'styles' : selected;

  const renderCurrentSidebarPanel = () => {
    switch (selectedSidebarTab) {
      case 'block-configuration':
        return <ConfigurationPanel />;
      case 'styles':
        return <StylesPanel />;
      case 'templates':
        return <TemplateLibraryPanel />;
    }
  };

  return (
    <Drawer anchor="right" open={inspectorDrawerOpen} width={INSPECTOR_DRAWER_WIDTH}>
      <div className="h-[49px] border-b border-divider px-4">
        <Tabs value={selectedSidebarTab} onValueChange={setSidebarTab} className="h-full">
          <Tab value="styles">{t('inspector.tab.styles')}</Tab>
          <Tab value="block-configuration">{t('inspector.tab.inspect')}</Tab>
          {hasTemplates && <Tab value="templates">{t('inspector.tab.templates')}</Tab>}
        </Tabs>
      </div>
      <div className="h-[calc(100%-49px)] overflow-auto">{renderCurrentSidebarPanel()}</div>
    </Drawer>
  );
}
