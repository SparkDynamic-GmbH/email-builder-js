import React from 'react';

import { TEditorBlock } from '../../../../editor/core';

import BlockButton from './BlockButton';
import { BUTTONS } from './buttons';

type BlocksMenuProps = {
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ onSelect }: BlocksMenuProps) {
  return (
    <div className="grid grid-cols-4 p-2">
      {BUTTONS.map((k, i) => (
        <BlockButton key={i} label={k.label} icon={k.icon} onClick={() => onSelect(k.block())} />
      ))}
    </div>
  );
}
