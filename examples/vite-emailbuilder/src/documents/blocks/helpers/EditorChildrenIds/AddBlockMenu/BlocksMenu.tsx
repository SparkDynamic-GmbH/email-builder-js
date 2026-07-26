import React from 'react';

import { EDITOR_REGISTRY, TEditorBlock } from '../../../../editor/core';

import BlockButton from './BlockButton';

type BlocksMenuProps = {
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ onSelect }: BlocksMenuProps) {
  return (
    <div className="grid grid-cols-4 p-2">
      {EDITOR_REGISTRY.menu.map((entry) => (
        <BlockButton key={entry.type} label={entry.label} icon={entry.icon} onClick={() => onSelect(entry.block())} />
      ))}
    </div>
  );
}
