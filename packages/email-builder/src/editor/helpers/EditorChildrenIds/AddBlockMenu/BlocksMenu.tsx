import React from 'react';

import { useEditorRegistry } from '../../../../editor/EditorContext';
import { TEditorBlock } from '../../../../editor/types';
import { useTranslate } from '../../../i18n';

import BlockButton from './BlockButton';

type BlocksMenuProps = {
  onSelect: (block: TEditorBlock) => void;
};
export default function BlocksMenu({ onSelect }: BlocksMenuProps) {
  const t = useTranslate();
  const { menu } = useEditorRegistry();

  // A block's label is translated by convention, under `block.<type>`. A host's
  // own block has no such key unless it supplied one through `translations`, so
  // an unresolved key falls back to the label its definition gave.
  const labelOf = (type: string, label: string) => {
    const key = `block.${type}`;
    const translated = t(key);
    return translated === key ? label : translated;
  };

  return (
    <div className="grid grid-cols-4 p-2">
      {menu.map((entry) => (
        <BlockButton
          key={entry.type}
          label={labelOf(entry.type, entry.label)}
          icon={entry.icon}
          onClick={() => onSelect(entry.block())}
        />
      ))}
    </div>
  );
}
