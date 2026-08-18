import React, { useCallback, useEffect, useRef } from 'react';

import { Card, CardProps } from '../../../exports/blocks';
import { useCurrentBlockId } from '../../EditorBlock';
import { useDocument, useEditorActions } from '../../EditorContext';
import EditorChildrenIds from '../../helpers/EditorChildrenIds';
import { CanvasImagePickerOverlay, TImageLibraryItem, useImageLibrary } from '../../imageLibrary';

const PLACEHOLDER_URL = 'https://placehold.co/600x400@2x/F8F8F8/CCC?text=Your%20image';
const STARTER_PADDING = { top: 16, bottom: 16, left: 24, right: 24 };

function generateChildId() {
  return `block-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

/**
 * A hover overlay on the canvas image opens the host's image library, same as the sidebar's picker button.
 * A Card with no `childrenIds` at all (never initialized) gets a starter Heading/Text/Button, matching
 * this block's pre-container default look; `childrenIds` is `[]`, not undefined, once the user has
 * emptied it on purpose, so this never re-seeds after a deliberate delete.
 */
export default function CardEditor(props: CardProps) {
  const { setDocument, setSelectedBlockId } = useEditorActions();
  const currentBlockId = useCurrentBlockId();
  const document = useDocument();
  const library = useImageLibrary();

  const hasSeededRef = useRef(false);
  useEffect(() => {
    if (hasSeededRef.current || props.props?.childrenIds !== undefined) {
      return;
    }
    hasSeededRef.current = true;
    const headingId = generateChildId();
    const textId = generateChildId();
    const buttonId = generateChildId();
    setDocument({
      [headingId]: { type: 'Heading', data: { props: { text: 'New arrival' }, style: { padding: STARTER_PADDING } } },
      [textId]: {
        type: 'Text',
        data: {
          props: { text: 'A short description of the product goes here.' },
          style: { padding: STARTER_PADDING, fontWeight: 'normal' },
        },
      },
      [buttonId]: {
        type: 'Button',
        data: {
          props: { text: 'Shop now', url: 'https://example.com' },
          style: { padding: STARTER_PADDING },
        },
      },
      [currentBlockId]: {
        type: 'Card',
        data: {
          ...document[currentBlockId].data,
          props: { ...props.props, childrenIds: [headingId, textId, buttonId] },
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentUrl = props.props?.imageUrl ?? null;

  // The library's alt text fills a blank one, never replaces what was typed.
  const applyLibraryItem = useCallback(
    ({ url, alt }: TImageLibraryItem) => {
      const hasAlt = (props.props?.imageAlt ?? '').trim().length > 0;
      setDocument({
        [currentBlockId]: {
          type: 'Card',
          data: { ...props, props: { ...props.props, imageUrl: url, ...(!hasAlt && alt ? { imageAlt: alt } : {}) } },
        },
      });
    },
    [currentBlockId, props, setDocument]
  );

  const childrenIds = props.props?.childrenIds ?? [];

  return (
    <Card
      style={props.style}
      props={{ ...props.props, imageUrl: props.props?.imageUrl ?? PLACEHOLDER_URL }}
      imageOverlay={
        library ? (
          <CanvasImagePickerOverlay library={library} currentUrl={currentUrl} onSelect={applyLibraryItem} />
        ) : undefined
      }
    >
      <EditorChildrenIds
        childrenIds={childrenIds}
        onChange={({ blocks, blockId, childrenIds }) => {
          setDocument({
            ...blocks,
            [currentBlockId]: {
              type: 'Card',
              data: { ...document[currentBlockId].data, props: { ...props.props, childrenIds } },
            },
          });
          setSelectedBlockId(blockId);
        }}
      />
    </Card>
  );
}
