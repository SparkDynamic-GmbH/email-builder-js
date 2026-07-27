import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Card, CardProps } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions } from '../../EditorContext';
import { ImageLibraryDialog, TImageLibraryItem, toImageLibraryItem, useImageLibrary } from '../../imageLibrary';

const PLACEHOLDER_URL = 'https://placehold.co/600x400@2x/F8F8F8/CCC?text=Your%20image';

/** Clicking the image on the canvas opens the host's image library, same as the sidebar's picker button. */
export default function CardEditor(props: CardProps) {
  const { setDocument } = useEditorActions();
  const blockId = useCurrentBlockId();
  const library = useImageLibrary();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const currentUrl = props.props?.imageUrl ?? null;

  // The library's alt text fills a blank one, never replaces what was typed.
  const applyLibraryItem = useCallback(
    ({ url, alt }: TImageLibraryItem) => {
      const hasAlt = (props.props?.imageAlt ?? '').trim().length > 0;
      setDocument({
        [blockId]: {
          type: 'Card',
          data: { ...props, props: { ...props.props, imageUrl: url, ...(!hasAlt && alt ? { imageAlt: alt } : {}) } },
        },
      });
    },
    [blockId, props, setDocument]
  );

  const onImageClick = useCallback(() => {
    if (!library) {
      return;
    }
    const { pick } = library;
    if (pick) {
      // A failed or aborted pick is silent here — the sidebar's picker button is where the error shows.
      pick({ url: currentUrl })
        .then((result) => {
          if (isMountedRef.current && result !== null && result !== undefined) {
            applyLibraryItem(toImageLibraryItem(result));
          }
        })
        .catch(() => {});
    } else {
      setIsDialogOpen(true);
    }
  }, [applyLibraryItem, currentUrl, library]);

  return (
    <>
      <Card
        style={props.style}
        props={{ ...props.props, imageUrl: props.props?.imageUrl ?? PLACEHOLDER_URL }}
        onImageClick={library ? onImageClick : undefined}
      />
      {isDialogOpen && library && (
        <ImageLibraryDialog
          library={library}
          onClose={() => setIsDialogOpen(false)}
          onSelect={(item) => {
            setIsDialogOpen(false);
            applyLibraryItem(item);
          }}
        />
      )}
    </>
  );
}
