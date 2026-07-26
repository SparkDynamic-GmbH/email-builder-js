import React from 'react';

import { useDocument, useEditorActions, useEditorRegistry, useSelectedBlockId } from '../../EditorContext';

function renderMessage(val: string) {
  return (
    <div className="m-6 border border-dashed border-divider p-2">
      <p className="text-body1 text-txt-secondary">{val}</p>
    </div>
  );
}

export default function ConfigurationPanel() {
  const { setDocument } = useEditorActions();
  const { definitions, SidebarPanel } = useEditorRegistry();
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();

  if (!selectedBlockId) {
    return renderMessage('Click on a block to inspect.');
  }
  const block = document[selectedBlockId];
  if (!block) {
    return renderMessage(`Block with id ${selectedBlockId} was not found. Click on a block to reset.`);
  }

  if (!definitions[block.type]?.SidebarPanel) {
    return <pre>{JSON.stringify(block, null, '  ')}</pre>;
  }

  return (
    <SidebarPanel key={selectedBlockId} block={block} setBlock={(conf) => setDocument({ [selectedBlockId]: conf })} />
  );
}
