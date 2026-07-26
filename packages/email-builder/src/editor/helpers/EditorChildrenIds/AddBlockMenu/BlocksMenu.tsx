import React from 'react';

import { useEditorRegistry } from '../../../../editor/EditorContext';
import { TEditorBlock } from '../../../../editor/types';

import BlockButton from './BlockButton';

type BlocksMenuProps = {
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ onSelect }: BlocksMenuProps) {
  const { menu } = useEditorRegistry();

  return (
    <div className="grid grid-cols-4 p-2">
      {menu.map((entry) => (
        <BlockButton key={entry.type} label={entry.label} icon={entry.icon} onClick={() => onSelect(entry.block())} />
      ))}
    </div>
  );
}
