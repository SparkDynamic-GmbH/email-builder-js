import { ImageUp, Loader2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslate } from '../i18n';
import Button from '../ui/Button';
import cn from '../ui/cn';
import Dialog, { DialogActions, DialogContent } from '../ui/Dialog';
import TextField from '../ui/TextField';

import {
  formatBytes,
  imageLibraryAccept,
  imageLibraryItemKey,
  isAbortError,
  matchesAccept,
  toImageLibraryItem,
} from './helpers';
import { TImageLibrary, TImageLibraryItem } from './types';

/** Long enough that typing a word is one request. */
const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  library: TImageLibrary;
  onClose: () => void;
  onSelect: (item: TImageLibraryItem) => void;
};

function errorMessage(error: unknown, fallback: string): string {
  const message = error instanceof Error ? error.message : String(error ?? '');
  return message.trim().length > 0 ? message : fallback;
}

/**
 * The editor's own picker: a dropzone when the library can `upload`, a
 * searchable grid when it can `list`, both when it can do both.
 *
 * An upload applies as soon as it lands — the user already chose the file — so
 * the Select button exists only for the grid.
 */
export default function ImageLibraryDialog({ library, onClose, onSelect }: Props) {
  const t = useTranslate();

  // Read the library through a ref: a host that builds it inline would
  // otherwise restart the in-flight request on every render.
  const libraryRef = useRef(library);
  useEffect(() => {
    libraryRef.current = library;
  });

  const canUpload = Boolean(library.upload);
  const canList = Boolean(library.list);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const [items, setItems] = useState<TImageLibraryItem[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(canList);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const moreControllerRef = useRef<AbortController | null>(null);
  const uploadControllerRef = useRef<AbortController | null>(null);

  // Closing the dialog is a cancellation: drop whatever is still in flight.
  useEffect(
    () => () => {
      moreControllerRef.current?.abort();
      uploadControllerRef.current?.abort();
    },
    []
  );

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  // First page, and every re-search or retry.
  useEffect(() => {
    const list = libraryRef.current.list;
    if (!list) {
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    list({ query: debouncedQuery, cursor: null, signal: controller.signal }).then(
      (result) => {
        if (controller.signal.aborted) {
          return;
        }
        setItems(result.items ?? []);
        setCursor(result.nextCursor ?? null);
        setIsLoading(false);
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          return;
        }
        setLoadError(errorMessage(error, t('imageLibrary.error.load')));
        setIsLoading(false);
      }
    );

    return () => controller.abort();
  }, [debouncedQuery, reloadToken, t]);

  const loadMore = useCallback(() => {
    const list = libraryRef.current.list;
    if (!list || cursor === null) {
      return;
    }

    moreControllerRef.current?.abort();
    const controller = new AbortController();
    moreControllerRef.current = controller;
    setIsLoadingMore(true);
    setLoadError(null);

    list({ query: debouncedQuery, cursor, signal: controller.signal }).then(
      (result) => {
        if (controller.signal.aborted) {
          return;
        }
        setItems((previous) => [...previous, ...(result.items ?? [])]);
        setCursor(result.nextCursor ?? null);
        setIsLoadingMore(false);
      },
      (error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          return;
        }
        setLoadError(errorMessage(error, t('imageLibrary.error.load')));
        setIsLoadingMore(false);
      }
    );
  }, [cursor, debouncedQuery, t]);

  const upload = useCallback(
    (file: File) => {
      const handler = libraryRef.current.upload;
      if (!handler || isUploading) {
        return;
      }

      const accept = imageLibraryAccept(libraryRef.current);
      if (!matchesAccept(file, accept)) {
        setUploadError(t('imageLibrary.error.type', { name: file.name }));
        return;
      }
      const limit = libraryRef.current.maxFileSizeBytes;
      if (typeof limit === 'number' && file.size > limit) {
        setUploadError(t('imageLibrary.error.tooLarge', { name: file.name, limit: formatBytes(limit) }));
        return;
      }

      uploadControllerRef.current?.abort();
      const controller = new AbortController();
      uploadControllerRef.current = controller;
      setIsUploading(true);
      setUploadError(null);

      handler(file, { signal: controller.signal }).then(
        (result) => {
          if (controller.signal.aborted) {
            return;
          }
          setIsUploading(false);
          onSelect(toImageLibraryItem(result));
        },
        (error: unknown) => {
          if (controller.signal.aborted || isAbortError(error)) {
            return;
          }
          setUploadError(errorMessage(error, t('imageLibrary.error.upload')));
          setIsUploading(false);
        }
      );
    },
    [isUploading, onSelect, t]
  );

  const selected = items.find((item) => imageLibraryItemKey(item) === selectedKey) ?? null;

  return (
    <Dialog title={t('imageLibrary.title')} onClose={onClose}>
      <DialogContent>
        <div className="flex flex-col gap-4">
          {canUpload && (
            <div className="flex flex-col gap-1">
              <label
                aria-busy={isUploading}
                onDragOver={(ev) => {
                  ev.preventDefault();
                  setIsDraggingOver(true);
                }}
                onDragLeave={() => setIsDraggingOver(false)}
                onDrop={(ev) => {
                  ev.preventDefault();
                  setIsDraggingOver(false);
                  const file = ev.dataTransfer.files?.[0];
                  if (file) {
                    upload(file);
                  }
                }}
                className={cn(
                  'flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 py-6',
                  'text-body2 text-txt-secondary transition-colors',
                  'has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand-blue',
                  isUploading ? 'pointer-events-none opacity-60' : undefined,
                  isDraggingOver ? 'border-brand-blue bg-brand-blue/5' : 'border-grey-400 hover:border-grey-500'
                )}
              >
                {isUploading ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <ImageUp className="size-6" aria-hidden="true" />
                )}
                <span>{isUploading ? t('imageLibrary.uploading') : t('imageLibrary.dropzone')}</span>
                {/* A <label> opens the picker natively on click — no JS `.click()` to flake on. */}
                <input
                  type="file"
                  disabled={isUploading}
                  className="sr-only"
                  accept={imageLibraryAccept(library)}
                  onChange={(ev) => {
                    const file = ev.target.files?.[0];
                    // Reset so choosing the same file twice fires again.
                    ev.target.value = '';
                    if (file) {
                      upload(file);
                    }
                  }}
                />
              </label>
              {uploadError && (
                <p role="alert" className="text-body2 text-brand-red">
                  {uploadError}
                </p>
              )}
            </div>
          )}

          {canList && (
            <div className="flex flex-col gap-3">
              <TextField
                label={t('imageLibrary.search')}
                placeholder={t('imageLibrary.searchPlaceholder')}
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
              />

              <div className="max-h-[320px] overflow-y-auto">
                {isLoading ? (
                  <p className="py-6 text-center text-body2 text-txt-secondary">{t('imageLibrary.loading')}</p>
                ) : loadError !== null ? (
                  <div className="flex flex-col items-center gap-2 py-6">
                    <p role="alert" className="text-body2 text-brand-red">
                      {loadError}
                    </p>
                    <Button variant="outlined" size="small" onClick={() => setReloadToken((n) => n + 1)}>
                      {t('imageLibrary.retry')}
                    </Button>
                  </div>
                ) : items.length === 0 ? (
                  <p className="py-6 text-center text-body2 text-txt-secondary">{t('imageLibrary.empty')}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {items.map((item) => {
                      const key = imageLibraryItemKey(item);
                      return (
                        <button
                          key={key}
                          type="button"
                          role="option"
                          aria-selected={key === selectedKey}
                          title={item.name ?? item.alt ?? item.url}
                          onClick={() => setSelectedKey(key)}
                          onDoubleClick={() => onSelect(item)}
                          className={cn(
                            'flex flex-col gap-1 rounded-sm border p-1 text-left transition-colors',
                            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue',
                            'border-transparent hover:border-grey-400',
                            'aria-selected:border-brand-blue aria-selected:bg-brand-blue/5'
                          )}
                        >
                          <img
                            src={item.thumbnailUrl ?? item.url}
                            alt={item.alt ?? item.name ?? ''}
                            loading="lazy"
                            className="h-20 w-full rounded-xs bg-grey-100 object-contain"
                          />
                          {item.name && <span className="truncate text-body2 text-txt-secondary">{item.name}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {cursor !== null && loadError === null && !isLoading && (
                <div className="flex justify-center">
                  <Button variant="outlined" size="small" disabled={isLoadingMore} onClick={loadMore}>
                    {isLoadingMore ? t('imageLibrary.loading') : t('imageLibrary.loadMore')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t('imageLibrary.cancel')}</Button>
        {canList && (
          <Button variant="contained" disabled={selected === null} onClick={() => selected && onSelect(selected)}>
            {t('imageLibrary.select')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
