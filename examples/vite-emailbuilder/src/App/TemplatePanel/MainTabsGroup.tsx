import { Braces, Code, Eye, Pencil } from 'lucide-react';
import React from 'react';

import { setSelectedMainTab, useSelectedMainTab } from '../../documents/editor/EditorContext';
import Tabs, { Tab } from '../../ui/Tabs';

export default function MainTabsGroup() {
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
      <Tab value="editor" tooltip="Edit">
        <Pencil className="size-5" />
      </Tab>
      <Tab value="preview" tooltip="Preview">
        <Eye className="size-5" />
      </Tab>
      <Tab value="html" tooltip="HTML output">
        <Code className="size-5" />
      </Tab>
      <Tab value="json" tooltip="JSON output">
        <Braces className="size-5" />
      </Tab>
    </Tabs>
  );
}
