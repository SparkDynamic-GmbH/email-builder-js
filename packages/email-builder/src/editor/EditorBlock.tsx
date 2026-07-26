import React, { createContext, useContext } from 'react';

import { useBlock, useEditorRegistry } from './EditorContext';

const EditorBlockContext = createContext<string | null>(null);
export const useCurrentBlockId = () => useContext(EditorBlockContext)!;

type EditorBlockProps = {
  id: string;
};

/**
 *
 * @param id - Block id
 * @returns EditorBlock component that loads data from the editor store
 */
export default function EditorBlock({ id }: EditorBlockProps) {
  const registry = useEditorRegistry();
  const block = useBlock(id);
  if (!block) {
    throw new Error('Could not find block');
  }
  const { EditorBlockComponent } = registry;
  return (
    <EditorBlockContext.Provider value={id}>
      <EditorBlockComponent {...block} />
    </EditorBlockContext.Provider>
  );
}
