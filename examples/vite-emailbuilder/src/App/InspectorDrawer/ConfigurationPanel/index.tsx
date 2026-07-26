import React from 'react';

import { EDITOR_REGISTRY } from '../../../documents/editor/core';
import { setDocument, useDocument, useSelectedBlockId } from '../../../documents/editor/EditorContext';

function renderMessage(val: string) {
  return (
    <div className="m-6 border border-dashed border-divider p-2">
      <p className="text-body1 text-txt-secondary">{val}</p>
    </div>
  );
}

export default function ConfigurationPanel() {
  const document = useDocument();
  const selectedBlockId = useSelectedBlockId();

  if (!selectedBlockId) {
    return renderMessage('Click on a block to inspect.');
  }
  const block = document[selectedBlockId];
  if (!block) {
    return renderMessage(`Block with id ${selectedBlockId} was not found. Click on a block to reset.`);
  }

  if (!EDITOR_REGISTRY.definitions[block.type]?.SidebarPanel) {
    return <pre>{JSON.stringify(block, null, '  ')}</pre>;
  }

  return (
    <EDITOR_REGISTRY.SidebarPanel
      key={selectedBlockId}
      block={block}
      setBlock={(conf) => setDocument({ [selectedBlockId]: conf })}
    />
  );
}
