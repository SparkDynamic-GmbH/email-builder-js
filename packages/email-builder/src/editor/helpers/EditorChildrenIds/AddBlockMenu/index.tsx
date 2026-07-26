import { Popover as RadixPopover } from 'radix-ui';
import React, { useState } from 'react';

import { TEditorBlock } from '../../../../editor/types';

import BlocksMenu from './BlocksMenu';
import DividerButton from './DividerButton';
import PlaceholderButton from './PlaceholderButton';

type Props = {
  placeholder?: boolean;
  onSelect: (block: TEditorBlock) => void;
};

/**
 * Uses Radix's Popover.Anchor rather than the usual Trigger: DividerButton
 * needs the wrapper element to decide whether the cursor is near enough to
 * reveal itself, so the wrapper anchors the menu and the buttons open it.
 */
export default function AddBlockButton({ onSelect, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [buttonElement, setButtonElement] = useState<HTMLElement | null>(null);

  const handleButtonClick = () => {
    setOpen(true);
  };

  const renderButton = () => {
    if (placeholder) {
      return <PlaceholderButton onClick={handleButtonClick} />;
    } else {
      return <DividerButton buttonElement={buttonElement} onClick={handleButtonClick} />;
    }
  };

  return (
    <RadixPopover.Root open={open} onOpenChange={setOpen}>
      <RadixPopover.Anchor asChild>
        <div ref={setButtonElement} style={{ position: 'relative' }}>
          {renderButton()}
        </div>
      </RadixPopover.Anchor>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side="bottom"
          align="center"
          sideOffset={4}
          className="z-50 rounded-sm bg-white shadow-e3"
          onClick={(ev) => ev.stopPropagation()}
        >
          <BlocksMenu
            onSelect={(block) => {
              onSelect(block);
              setOpen(false);
            }}
          />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
