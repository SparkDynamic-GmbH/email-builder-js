import { Braces, Code, Eye, Pencil } from 'lucide-react';
import React from 'react';

import { Tab, Tabs, useEditorActions, useSelectedMainTab, useTranslate } from '@sparkdynamic/email-builder/editor';

export default function MainTabsGroup() {
  const t = useTranslate();
  const { setSelectedMainTab } = useEditorActions();
  const selectedMainTab = useSelectedMainTab();
  const handleChange = (v: string) => {
    switch (v) {
      case 'json':
      case 'preview':
      case 'editor':
      case 'html':
        setSelectedMainTab(v);
        return;
      default:
        setSelectedMainTab('editor');
    }
  };

  return (
    <Tabs value={selectedMainTab} onValueChange={handleChange} className="h-full">
      <Tab value="editor" tooltip={t('app.tab.edit')}>
        <Pencil className="size-5" />
      </Tab>
      <Tab value="preview" tooltip={t('app.tab.preview')}>
        <Eye className="size-5" />
      </Tab>
      <Tab value="html" tooltip={t('app.tab.html')}>
        <Code className="size-5" />
      </Tab>
      <Tab value="json" tooltip={t('app.tab.json')}>
        <Braces className="size-5" />
      </Tab>
    </Tabs>
  );
}
