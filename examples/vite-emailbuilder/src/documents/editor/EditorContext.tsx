import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { createStore, useStore } from 'zustand';

import { BaseZodDictionary, BlockConfiguration, BlockRegistry } from '@sparkdynamic/email-builder';

import { TEditorBlock, TEditorConfiguration, TEditorRegistry } from './types';

type TEditorState = {
  document: TEditorConfiguration;

  selectedBlockId: string | null;
  selectedSidebarTab: 'block-configuration' | 'styles';
  selectedMainTab: 'editor' | 'preview' | 'json' | 'html';
  selectedScreenSize: 'desktop' | 'mobile';

  inspectorDrawerOpen: boolean;
};

export type TEditorActions = {
  /** Merges the given blocks into the document. */
  setDocument: (document: TEditorConfiguration) => void;
  /** Replaces the whole document and clears the selection. */
  resetDocument: (document: TEditorConfiguration) => void;
  setSelectedBlockId: (selectedBlockId: string | null) => void;
  setSidebarTab: (selectedSidebarTab: TEditorState['selectedSidebarTab']) => void;
  setSelectedMainTab: (selectedMainTab: TEditorState['selectedMainTab']) => void;
  setSelectedScreenSize: (selectedScreenSize: TEditorState['selectedScreenSize']) => void;
  toggleInspectorDrawerOpen: () => void;
};

type TEditorStore = ReturnType<typeof createEditorStore>;

function createEditorStore(document: TEditorConfiguration) {
  return createStore<TEditorState>(() => ({
    document,
    selectedBlockId: null,
    selectedSidebarTab: 'styles',
    selectedMainTab: 'editor',
    selectedScreenSize: 'desktop',

    inspectorDrawerOpen: true,
  }));
}

type TEditorContextValue = {
  store: TEditorStore;
  actions: TEditorActions;
  registry: TEditorRegistry;
};

const EditorContext = createContext<TEditorContextValue | null>(null);

function useEditorContext() {
  const context = useContext(EditorContext);
  if (context === null) {
    throw new Error('Editor hooks must be used inside an EmailBuilderProvider');
  }
  return context;
}

function useEditorState<T>(selector: (state: TEditorState) => T) {
  return useStore(useEditorContext().store, selector);
}

export type EmailBuilderProviderProps<T extends BaseZodDictionary> = {
  /**
   * The block set, as built by `buildBlockRegistry`. Pass the built-in
   * definitions plus any of your own; canvas, inspector and add-block menu all
   * follow from it.
   */
  registry: BlockRegistry<T>;
  /** The document to start from. Later changes to this prop are ignored. */
  initialDocument: Record<string, BlockConfiguration<T>>;
  /** Called whenever the document changes — the hook for autosave. */
  onChange?: (document: TEditorConfiguration) => void;
  children: React.ReactNode;
};

/**
 * Owns one editor's state. Everything below it — canvas, inspector, add-block
 * menu — reads that state through the hooks in this module, so two providers on
 * a page are two independent editors.
 */
export function EmailBuilderProvider<T extends BaseZodDictionary>({
  registry,
  initialDocument,
  onChange,
  children,
}: EmailBuilderProviderProps<T>) {
  // The one place the block set is erased; see TEditorRegistry.
  const erasedRegistry = registry as TEditorRegistry;

  const storeRef = useRef<TEditorStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createEditorStore(initialDocument as TEditorConfiguration);
  }
  const store = storeRef.current;

  const actions = useMemo<TEditorActions>(
    () => ({
      setDocument: (document) => store.setState((state) => ({ document: { ...state.document, ...document } })),
      resetDocument: (document) => store.setState({ document, selectedSidebarTab: 'styles', selectedBlockId: null }),
      setSelectedBlockId: (selectedBlockId) =>
        store.setState({
          selectedBlockId,
          selectedSidebarTab: selectedBlockId === null ? 'styles' : 'block-configuration',
          ...(selectedBlockId === null ? {} : { inspectorDrawerOpen: true }),
        }),
      setSidebarTab: (selectedSidebarTab) => store.setState({ selectedSidebarTab }),
      setSelectedMainTab: (selectedMainTab) => store.setState({ selectedMainTab }),
      setSelectedScreenSize: (selectedScreenSize) => store.setState({ selectedScreenSize }),
      toggleInspectorDrawerOpen: () => store.setState((state) => ({ inspectorDrawerOpen: !state.inspectorDrawerOpen })),
    }),
    [store]
  );

  useEffect(() => {
    if (!onChange) {
      return;
    }
    // Fires on document changes only, not on selection or panel state.
    let previous = store.getState().document;
    return store.subscribe(() => {
      const { document } = store.getState();
      if (document !== previous) {
        previous = document;
        onChange(document);
      }
    });
  }, [store, onChange]);

  const value = useMemo<TEditorContextValue>(
    () => ({ store, actions, registry: erasedRegistry }),
    [store, actions, erasedRegistry]
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

/** The block set this editor was given. */
export function useEditorRegistry() {
  return useEditorContext().registry;
}

/** Stable for the lifetime of the provider, so it is safe in effect deps. */
export function useEditorActions() {
  return useEditorContext().actions;
}

export function useDocument() {
  return useEditorState((s) => s.document);
}

export function useBlock(blockId: string): TEditorBlock | undefined {
  return useEditorState((s) => s.document[blockId]);
}

export function useSelectedBlockId() {
  return useEditorState((s) => s.selectedBlockId);
}

export function useSelectedScreenSize() {
  return useEditorState((s) => s.selectedScreenSize);
}

export function useSelectedMainTab() {
  return useEditorState((s) => s.selectedMainTab);
}

export function useSelectedSidebarTab() {
  return useEditorState((s) => s.selectedSidebarTab);
}

export function useInspectorDrawerOpen() {
  return useEditorState((s) => s.inspectorDrawerOpen);
}
