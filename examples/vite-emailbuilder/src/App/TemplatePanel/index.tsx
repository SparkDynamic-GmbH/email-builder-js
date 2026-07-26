import { Monitor, Smartphone } from 'lucide-react';
import React, { CSSProperties } from 'react';

import {
  EditorBlock,
  SaveButton,
  ToggleButton,
  ToggleGroup,
  ToggleInspectorPanelButton,
  useDocument,
  useEditorActions,
  useSelectedMainTab,
  useSelectedScreenSize,
  useTranslate,
} from '@sparkdynamic/email-builder/editor';

import { Reader, TEditorConfiguration } from '../../registry';

import DownloadJson from './DownloadJson';
import HtmlPanel from './HtmlPanel';
import ImportJson from './ImportJson';
import JsonPanel from './JsonPanel';
import LanguageToggle from './LanguageToggle';
import MainTabsGroup from './MainTabsGroup';
import ShareButton from './ShareButton';

const MOBILE_FRAME: CSSProperties = {
  margin: '32px auto',
  width: 370,
  height: 800,
  boxShadow:
    'rgba(33, 36, 67, 0.04) 0px 10px 20px, rgba(33, 36, 67, 0.04) 0px 2px 6px, rgba(33, 36, 67, 0.04) 0px 0px 1px',
};

export default function TemplatePanel() {
  const t = useTranslate();
  const { setSelectedScreenSize } = useEditorActions();
  // The editor works over any block set; this app knows it registered its own.
  const document = useDocument() as TEditorConfiguration;
  const selectedMainTab = useSelectedMainTab();
  const selectedScreenSize = useSelectedScreenSize();

  const mainBoxStyle: CSSProperties =
    selectedScreenSize === 'mobile' ? { height: '100%', ...MOBILE_FRAME } : { height: '100%' };

  const handleScreenSizeChange = (value: string) => {
    switch (value) {
      case 'mobile':
      case 'desktop':
        setSelectedScreenSize(value);
        return;
      default:
        setSelectedScreenSize('desktop');
    }
  };

  const renderMainPanel = () => {
    switch (selectedMainTab) {
      case 'editor':
        return (
          <div style={mainBoxStyle}>
            <EditorBlock id="root" />
          </div>
        );
      case 'preview':
        return (
          <div style={mainBoxStyle}>
            <Reader document={document} rootBlockId="root" />
          </div>
        );
      case 'html':
        return <HtmlPanel />;
      case 'json':
        return <JsonPanel />;
    }
  };

  return (
    <>
      <div className="sticky top-0 z-20 flex h-[49px] items-center justify-between border-b border-divider bg-white px-2">
        {/* items-stretch so the active tab's indicator sits on the toolbar's bottom edge, as MUI's did. */}
        <div className="flex w-full items-stretch justify-between gap-4 px-4">
          <MainTabsGroup />
          <div className="flex items-center gap-4">
            <DownloadJson />
            <ImportJson />
            <ToggleGroup value={selectedScreenSize} onValueChange={handleScreenSizeChange}>
              <ToggleButton value="desktop" tooltip={t('app.view.desktop')}>
                <Monitor className="size-5" />
              </ToggleButton>
              <ToggleButton value="mobile" tooltip={t('app.view.mobile')}>
                <Smartphone className="size-5" />
              </ToggleButton>
            </ToggleGroup>
            <LanguageToggle />
            <ShareButton />
            <SaveButton size="small" />
          </div>
        </div>
        <ToggleInspectorPanelButton />
      </div>
      <div className="h-[calc(100vh-49px)] min-w-[370px] overflow-auto">{renderMainPanel()}</div>
    </>
  );
}
