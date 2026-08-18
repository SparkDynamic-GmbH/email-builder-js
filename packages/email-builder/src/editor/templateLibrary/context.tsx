import React, { createContext, useContext } from 'react';

import { isTemplateLibraryUsable } from './helpers';
import { TTemplateLibrary } from './types';

const TemplateLibraryContext = createContext<TTemplateLibrary | null>(null);

type Props = {
  library?: TTemplateLibrary;
  children: React.ReactNode;
};

/**
 * Publishes the host's template library to the canvas and the sidebar.
 * `EmailBuilderProvider` renders it from its `templateLibrary` prop, so a host
 * normally does not use this directly.
 *
 * It is its own module rather than part of the barrel because the barrel pulls
 * in the hook that reads `EditorContext`, and `EditorContext` renders this.
 */
export function TemplateLibraryProvider({ library, children }: Props) {
  return <TemplateLibraryContext.Provider value={library ?? null}>{children}</TemplateLibraryContext.Provider>;
}

/**
 * The configured library, or `null` — including when the host passed an object
 * that can neither save nor offer anything, so a call site can check for null.
 */
export function useTemplateLibrary(): TTemplateLibrary | null {
  const library = useContext(TemplateLibraryContext);
  return library !== null && isTemplateLibraryUsable(library) ? library : null;
}
