import React from 'react';

import { useTranslate } from '../i18n';
import cn from '../ui/cn';

import ImagePickerButton from './ImagePickerButton';
import { TImageLibrary, TImageLibraryItem } from './types';

type Props = {
  library: TImageLibrary;
  currentUrl: string | null;
  onSelect: (item: TImageLibraryItem) => void;
};

/**
 * The canvas-only trigger for a block's image: a hover overlay reading "Pick
 * image from media library" instead of a click handler on the image itself,
 * so a plain click still selects the block rather than opening the library.
 */
export default function CanvasImagePickerOverlay({ library, currentUrl, onSelect }: Props) {
  const t = useTranslate();

  return (
    <ImagePickerButton
      library={library}
      currentUrl={currentUrl}
      onSelect={onSelect}
      renderTrigger={({ onClick, disabled }) => (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            disabled={disabled}
            onClick={(ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              onClick();
            }}
            className={cn(
              'eb-chrome pointer-events-auto rounded-full bg-black/70 px-3 py-1.5 text-body2 text-white opacity-0',
              'transition-opacity duration-150 group-hover/image-overlay:opacity-100',
              'hover:bg-black/85 focus-visible:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white'
            )}
          >
            {t('imageLibrary.pickOverlay')}
          </button>
        </span>
      )}
    />
  );
}
