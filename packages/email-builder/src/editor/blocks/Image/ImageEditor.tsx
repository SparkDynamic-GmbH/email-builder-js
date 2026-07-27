import React, { useCallback } from 'react';

import { Image, ImageProps } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useEditorActions } from '../../EditorContext';
import { CanvasImagePickerOverlay, TImageLibraryItem, useImageLibrary } from '../../imageLibrary';

const PLACEHOLDER_URL = 'https://placehold.co/600x400@2x/F8F8F8/CCC?text=Your%20image';

/** A hover overlay on the canvas image opens the host's image library, same as the sidebar's picker button. */
export default function ImageEditor(props: ImageProps) {
  const { setDocument } = useEditorActions();
  const blockId = useCurrentBlockId();
  const library = useImageLibrary();

  const currentUrl = props.props?.url ?? null;

  // The library's alt text fills a blank one, never replaces what was typed.
  const applyLibraryItem = useCallback(
    ({ url, alt }: TImageLibraryItem) => {
      const hasAlt = (props.props?.alt ?? '').trim().length > 0;
      setDocument({
        [blockId]: {
          type: 'Image',
          data: { ...props, props: { ...props.props, url, ...(!hasAlt && alt ? { alt } : {}) } },
        },
      });
    },
    [blockId, props, setDocument]
  );

  return (
    <Image
      style={props.style}
      props={{ ...props.props, url: props.props?.url ?? PLACEHOLDER_URL }}
      imageOverlay={
        library ? (
          <CanvasImagePickerOverlay library={library} currentUrl={currentUrl} onSelect={applyLibraryItem} />
        ) : undefined
      }
    />
  );
}
