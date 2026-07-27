import { ImagePlus } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslate } from '../i18n';
import Button from '../ui/Button';

import { isAbortError, toImageLibraryItem } from './helpers';
import ImageLibraryDialog from './ImageLibraryDialog';
import { TImageLibrary, TImageLibraryItem } from './types';

type Props = {
  library: TImageLibrary;
  /** The block's current URL, so a host's own picker can preselect. */
  currentUrl: string | null;
  onSelect: (item: TImageLibraryItem) => void;
  /** Swaps the default sidebar button for a different trigger element, e.g. a canvas overlay. */
  renderTrigger?: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
};

/**
 * The one entry point into the host's image library. With a `pick` handler it
 * hands off and renders nothing of its own; otherwise it opens the built-in
 * dialog over whatever `upload`/`list` the host gave.
 */
export default function ImagePickerButton({ library, currentUrl, onSelect, renderTrigger }: Props) {
  const t = useTranslate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A host's `pick` may resolve after the panel has moved to another block.
  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const openHostPicker = useCallback(
    (pick: NonNullable<TImageLibrary['pick']>) => {
      setIsPicking(true);
      setError(null);
      pick({ url: currentUrl }).then(
        (result) => {
          if (!isMountedRef.current) {
            return;
          }
          setIsPicking(false);
          if (result !== null && result !== undefined) {
            onSelect(toImageLibraryItem(result));
          }
        },
        (err: unknown) => {
          if (!isMountedRef.current || isAbortError(err)) {
            return;
          }
          setIsPicking(false);
          const message = err instanceof Error ? err.message : String(err ?? '');
          setError(message.trim().length > 0 ? message : t('imageLibrary.error.pick'));
        }
      );
    },
    [currentUrl, onSelect, t]
  );

  const handleSelect = useCallback(
    (item: TImageLibraryItem) => {
      setIsDialogOpen(false);
      onSelect(item);
    },
    [onSelect]
  );

  const handleTriggerClick = useCallback(() => {
    const { pick } = library;
    if (pick) {
      openHostPicker(pick);
    } else {
      setIsDialogOpen(true);
    }
  }, [library, openHostPicker]);

  return (
    <div className="flex flex-col gap-1">
      {renderTrigger ? (
        renderTrigger({ onClick: handleTriggerClick, disabled: isPicking })
      ) : (
        <Button
          variant="outlined"
          size="small"
          className="self-start"
          disabled={isPicking}
          onClick={handleTriggerClick}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {t('imageLibrary.choose')}
        </Button>
      )}

      {error && (
        <p role="alert" className="text-body2 text-brand-red">
          {error}
        </p>
      )}

      {isDialogOpen && (
        <ImageLibraryDialog library={library} onClose={() => setIsDialogOpen(false)} onSelect={handleSelect} />
      )}
    </div>
  );
}
