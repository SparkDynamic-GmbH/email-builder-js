import React from 'react';

import { useDocument, useEditorActions } from '../EditorContext';
import { useTranslate } from '../i18n';
import { BlockDefaultsPanel } from '../styleDefaults';
import useExternalRevision from '../styleDefaults/useExternalRevision';

import EmailLayoutSidebarPanel from './ConfigurationPanel/input-panels/EmailLayoutSidebarPanel';

export default function StylesPanel() {
  const t = useTranslate();
  const block = useDocument().root;
  const { setDocument } = useEditorActions();
  // Applying a preset rewrites the layout from outside this panel, whose inputs
  // are uncontrolled — so remount it when that happens, and only then.
  const [revision, markOwnWrite] = useExternalRevision(block?.data);

  if (!block) {
    return <p>{t('inspector.rootNotFound')}</p>;
  }

  const { data, type } = block;
  if (type !== 'EmailLayout') {
    throw new Error('Expected "root" element to be of type EmailLayout');
  }

  return (
    <>
      <EmailLayoutSidebarPanel
        key={`root-${revision}`}
        data={data}
        setData={(data) => {
          markOwnWrite(data);
          setDocument({ root: { type, data } });
        }}
      />
      <BlockDefaultsPanel />
    </>
  );
}
