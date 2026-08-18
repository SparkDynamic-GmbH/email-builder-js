import React, { createContext, useContext, useMemo } from 'react';

import { isStylePresetLibraryUsable } from './helpers';
import { BUILT_IN_STYLE_PRESETS } from './presets';
import { TStylePresetLibrary } from './types';

const StylePresetContext = createContext<TStylePresetLibrary | null>(null);

type Props = {
  library?: TStylePresetLibrary;
  children: React.ReactNode;
};

/**
 * Publishes the host's style presets to the Styles tab. `EmailBuilderProvider`
 * renders it from its `stylePresets` prop, so a host normally does not use this
 * directly.
 *
 * Its own module rather than part of the barrel, for the same reason as the
 * template library's: the barrel pulls in hooks that read `EditorContext`, and
 * `EditorContext` renders this.
 */
export function StylePresetProvider({ library, children }: Props) {
  // The prop left out means "whatever the editor ships"; `{ presets: [] }` is
  // how a host says none, and stays distinguishable from it.
  const value = useMemo(() => library ?? { presets: BUILT_IN_STYLE_PRESETS }, [library]);
  return <StylePresetContext.Provider value={value}>{children}</StylePresetContext.Provider>;
}

/**
 * The configured library, or `null` — including when it can neither save nor
 * offer anything, so a call site can check for null.
 */
export function useStylePresets(): TStylePresetLibrary | null {
  const library = useContext(StylePresetContext);
  return library !== null && isStylePresetLibraryUsable(library) ? library : null;
}
