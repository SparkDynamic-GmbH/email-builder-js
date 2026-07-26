import React, { CSSProperties, useState } from 'react';

import { useCurrentBlockId } from '../../../editor/EditorBlock';
import { useEditorActions, useSelectedBlockId } from '../../../editor/EditorContext';

import TuneMenu from './TuneMenu';

type TEditorBlockWrapperProps = {
  children: React.JSX.Element;
};

export default function EditorBlockWrapper({ children }: TEditorBlockWrapperProps) {
  const { setSelectedBlockId } = useEditorActions();
  const selectedBlockId = useSelectedBlockId();
  const [mouseInside, setMouseInside] = useState(false);
  const blockId = useCurrentBlockId();

  let outline: CSSProperties['outline'];
  if (selectedBlockId === blockId) {
    outline = '2px solid rgba(0,121,204, 1)';
  } else if (mouseInside) {
    outline = '2px solid rgba(0,121,204, 0.3)';
  }

  const renderMenu = () => {
    if (selectedBlockId !== blockId) {
      return null;
    }
    return <TuneMenu blockId={blockId} />;
  };

  return (
    <div
      className="relative max-w-full [outline-offset:-1px]"
      style={{ outline }}
      onMouseEnter={(ev) => {
        setMouseInside(true);
        ev.stopPropagation();
      }}
      onMouseLeave={() => {
        setMouseInside(false);
      }}
      onClick={(ev) => {
        setSelectedBlockId(blockId);
        ev.stopPropagation();
        ev.preventDefault();
      }}
    >
      {renderMenu()}
      {children}
    </div>
  );
}
