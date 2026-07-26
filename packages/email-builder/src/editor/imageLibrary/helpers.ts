import { TImageLibrary, TImageLibraryItem } from './types';

/** Whether a library offers any way at all to get an image out of it. */
export function isImageLibraryUsable(library: TImageLibrary): boolean {
  return Boolean(library.pick || library.upload || library.list);
}

/** Lets `upload` and `pick` resolve with a bare URL when that is all there is. */
export function toImageLibraryItem(value: TImageLibraryItem | string): TImageLibraryItem {
  return typeof value === 'string' ? { url: value } : value;
}

/** Identity for keys and selection; `id` when the host has one, else the URL. */
export function imageLibraryItemKey(item: TImageLibraryItem): string {
  return item.id ?? item.url;
}

/** An abort is the dialog doing its job, not a failure worth reporting. */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

const ACCEPT_ALL = 'image/*';

/** The `accept` a library asked for, defaulted. */
export function imageLibraryAccept(library: TImageLibrary): string {
  return library.accept?.trim() || ACCEPT_ALL;
}

/**
 * Checks a file against an `accept` list the same way the file dialog's filter
 * does — extensions, exact MIME types, and `type/*` wildcards.
 */
export function matchesAccept(file: File, accept: string): boolean {
  const patterns = accept
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);
  if (patterns.length === 0) {
    return true;
  }

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  return patterns.some((pattern) => {
    if (pattern.startsWith('.')) {
      return name.endsWith(pattern);
    }
    if (pattern.endsWith('/*')) {
      return type.startsWith(pattern.slice(0, -1));
    }
    return type === pattern;
  });
}

/** Byte counts for the size-limit message — not a general-purpose formatter. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} kB`;
  }
  const mb = kb / 1024;
  return `${Math.round(mb * 10) / 10} MB`;
}
