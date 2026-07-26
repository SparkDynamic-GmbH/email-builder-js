import React from 'react';

import { useDocument, useEditorActions, useEditorRegistry, useSelectedBlockId } from '../../EditorContext';
import { useTranslate } from '../../i18n';

function renderMessage(val: string) {
  return (
    <div className="m-6 border border-dashed border-divider p-2">
      <p className="text-body1 text-txt-secondary">{val}</p>
    </div>
  );
}

export default function ConfigurationPanel() {
  const t = useTranslate();
  const { setDocument } = useEditorActions();
  const { definitions, SidebarPanel } = useEditorRegistry();
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();

  if (!selectedBlockId) {
    return renderMessage(t('inspector.empty'));
  }
  const block = document[selectedBlockId];
  if (!block) {
    return renderMessage(t('inspector.blockNotFound', { id: selectedBlockId }));
  }

  if (!definitions[block.type]?.SidebarPanel) {
    return <pre>{JSON.stringify(block, null, '  ')}</pre>;
  }

  return (
    <SidebarPanel key={selectedBlockId} block={block} setBlock={(conf) => setDocument({ [selectedBlockId]: conf })} />
  );
}
