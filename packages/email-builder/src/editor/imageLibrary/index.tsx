import React, { createContext, useContext } from 'react';

import { isImageLibraryUsable } from './helpers';
import { TImageLibrary } from './types';

export type {
  TImageLibrary,
  TImageLibraryItem,
  TImageLibraryListParams,
  TImageLibraryListResult,
  TImageLibraryUploadParams,
} from './types';

export {
  formatBytes,
  imageLibraryAccept,
  imageLibraryItemKey,
  isAbortError,
  isImageLibraryUsable,
  matchesAccept,
  toImageLibraryItem,
} from './helpers';

export { default as ImageLibraryDialog } from './ImageLibraryDialog';
export { default as ImagePickerButton } from './ImagePickerButton';

const ImageLibraryContext = createContext<TImageLibrary | null>(null);

type Props = {
  library?: TImageLibrary;
  children: React.ReactNode;
};

/**
 * Publishes the host's image library to the panels below. `EmailBuilderProvider`
 * renders it from its `imageLibrary` prop, so a host normally does not use this
 * directly.
 */
export function ImageLibraryProvider({ library, children }: Props) {
  return <ImageLibraryContext.Provider value={library ?? null}>{children}</ImageLibraryContext.Provider>;
}

/**
 * The configured library, or `null` — including when the host passed an object
 * with no usable member, so a call site can simply check for null.
 */
export function useImageLibrary(): TImageLibrary | null {
  const library = useContext(ImageLibraryContext);
  return library !== null && isImageLibraryUsable(library) ? library : null;
}
