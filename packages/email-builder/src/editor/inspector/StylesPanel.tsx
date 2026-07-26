import React from 'react';

import { useDocument, useEditorActions } from '../EditorContext';
import { useTranslate } from '../i18n';

import EmailLayoutSidebarPanel from './ConfigurationPanel/input-panels/EmailLayoutSidebarPanel';

export default function StylesPanel() {
  const t = useTranslate();
  const { setDocument } = useEditorActions();
  const block = useDocument().root;
  if (!block) {
    return <p>{t('inspector.rootNotFound')}</p>;
  }

  const { data, type } = block;
  if (type !== 'EmailLayout') {
    throw new Error('Expected "root" element to be of type EmailLayout');
  }

  return <EmailLayoutSidebarPanel key="root" data={data} setData={(data) => setDocument({ root: { type, data } })} />;
}
