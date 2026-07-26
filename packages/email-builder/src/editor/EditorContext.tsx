import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { createStore, useStore } from 'zustand';

import { BaseZodDictionary, BlockConfiguration, BlockRegistry } from '../core';

import { TEditorBlock, TEditorConfiguration, TEditorRegistry } from './types';

/**
 * Where the last `onSave` call got to. `saved` means the document that was
 * handed to `onSave` came back without throwing — check `useIsDirty()` as well,
 * since edits made while a save was in flight leave it saved *and* dirty.
 */
export type TSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

/** Long enough that a burst of typing is one save, short enough to not lose much. */
export const DEFAULT_AUTOSAVE_DEBOUNCE_MS = 10_000;

type TEditorState = {
  document: TEditorConfiguration;

  selectedBlockId: string | null;
  selectedSidebarTab: 'block-configuration' | 'styles';
  selectedMainTab: 'editor' | 'preview' | 'json' | 'html';
  selectedScreenSize: 'desktop' | 'mobile';

  inspectorDrawerOpen: boolean;

  saveStatus: TSaveStatus;
  saveError: Error | null;
  /** The document `onSave` last accepted; dirtiness is identity against it. */
  savedDocument: TEditorConfiguration | null;
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
  /**
   * Hands the current document to `onSave` and tracks the outcome. Resolves
   * when the save settles; never rejects — a failure lands in `useSaveError()`.
   * A call made while a save is in flight joins that one rather than starting a
   * second. No-op when the provider was given no `onSave`.
   */
  save: () => Promise<void>;
  /**
   * Marks the current document as saved without calling `onSave` — for a host
   * that persisted it by some other route (its own Save-as, an import that came
   * straight from the backend).
   */
  markSaved: () => void;
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

    saveStatus: 'idle',
    saveError: null,
    savedDocument: document,
  }));
}

type TEditorContextValue = {
  store: TEditorStore;
  actions: TEditorActions;
  registry: TEditorRegistry;
  /** Whether the provider was given an `onSave`; `SaveButton` hides without one. */
  canSave: boolean;
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
  /**
   * Called on every document change, undebounced — a change stream, not a save
   * hook. For persistence use `onSave`.
   */
  onChange?: (document: TEditorConfiguration) => void;
  /**
   * Persists the document. Called by the `save()` action — which is what
   * `SaveButton` calls — and, if `autosave` is on, on a debounce after edits.
   *
   * Rejecting marks the save failed and leaves the document dirty, so the
   * button offers a retry; returning a promise keeps the button in its saving
   * state until it settles.
   *
   * Its identity may change freely: it is read fresh on every call, so an
   * inline arrow is fine and does not restart a pending autosave.
   */
  onSave?: (document: TEditorConfiguration) => void | Promise<void>;
  /**
   * Save automatically after edits, on a debounce. **Off by default** — with it
   * off, the document is only persisted when something calls `save()`.
   */
  autosave?: boolean;
  /**
   * How long to wait after the last edit before autosaving, in milliseconds.
   * Defaults to 10 000. Every edit restarts the timer, so a run of keystrokes
   * or slider ticks saves once, with the latest document.
   *
   * A pending autosave is flushed when the provider unmounts, so switching away
   * from the editor does not lose the last edit. It is not flushed when the
   * page itself goes away — a host saving over the network still wants its own
   * `beforeunload`/`visibilitychange` handling for that.
   */
  autosaveDebounceMs?: number;
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
  onSave,
  autosave = false,
  autosaveDebounceMs = DEFAULT_AUTOSAVE_DEBOUNCE_MS,
  children,
}: EmailBuilderProviderProps<T>) {
  // The one place the block set is erased; see TEditorRegistry.
  const erasedRegistry = registry as TEditorRegistry;

  const storeRef = useRef<TEditorStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createEditorStore(initialDocument as TEditorConfiguration);
  }
  const store = storeRef.current;

  // Read callbacks through refs so the subscription below survives a host that
  // passes new closures every render — otherwise each render would tear down
  // the subscription and with it any pending autosave.
  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onChangeRef.current = onChange;
    onSaveRef.current = onSave;
  });

  // The save in flight, so a second caller joins it instead of racing it.
  const inFlightRef = useRef<Promise<void> | null>(null);

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
      markSaved: () => store.setState((state) => ({ savedDocument: state.document, saveStatus: 'saved' })),
      save: () => {
        const handler = onSaveRef.current;
        if (!handler) {
          return Promise.resolve();
        }
        if (inFlightRef.current) {
          return inFlightRef.current;
        }

        // Snapshot: edits landing mid-save must stay dirty, so what comes back
        // marked saved is the document the handler actually got.
        const document = store.getState().document;
        store.setState({ saveStatus: 'saving', saveError: null });

        const succeeded = () => {
          store.setState({ saveStatus: 'saved', saveError: null, savedDocument: document });
        };
        const failed = (error: unknown) => {
          store.setState({
            saveStatus: 'error',
            saveError: error instanceof Error ? error : new Error(String(error)),
          });
        };

        // Called synchronously, so a host testing with fake timers sees the
        // call land on the tick the autosave fired rather than a microtask later.
        let result: void | Promise<void>;
        try {
          result = handler(document);
        } catch (error) {
          failed(error);
          return Promise.resolve();
        }

        const promise = Promise.resolve(result)
          .then(succeeded, failed)
          .finally(() => {
            inFlightRef.current = null;
          });

        inFlightRef.current = promise;
        return promise;
      },
    }),
    [store]
  );

  useEffect(() => {
    // Fires on document changes only, not on selection or panel state.
    let previous = store.getState().document;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let pending = false;

    const flush = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
      }
      if (!pending) {
        return;
      }
      pending = false;
      void actions.save();
    };

    const unsubscribe = store.subscribe(() => {
      const { document } = store.getState();
      if (document === previous) {
        return;
      }
      previous = document;

      onChangeRef.current?.(document);

      if (!autosave) {
        return;
      }
      pending = true;
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(flush, Math.max(0, autosaveDebounceMs));
    });

    return () => {
      unsubscribe();
      // Don't drop the last edit on unmount, or when autosave settings change.
      flush();
    };
  }, [store, actions, autosave, autosaveDebounceMs]);

  const canSave = onSave !== undefined;

  const value = useMemo<TEditorContextValue>(
    () => ({ store, actions, registry: erasedRegistry, canSave }),
    [store, actions, erasedRegistry, canSave]
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

/** Whether an `onSave` was given at all — `SaveButton` renders nothing without one. */
export function useCanSave() {
  return useEditorContext().canSave;
}

export function useSaveStatus() {
  return useEditorState((s) => s.saveStatus);
}

/** Why the last save failed, or `null`. Cleared when the next save starts. */
export function useSaveError() {
  return useEditorState((s) => s.saveError);
}

/** Whether the document has changed since the last successful save. */
export function useIsDirty() {
  return useEditorState((s) => s.document !== s.savedDocument);
}
