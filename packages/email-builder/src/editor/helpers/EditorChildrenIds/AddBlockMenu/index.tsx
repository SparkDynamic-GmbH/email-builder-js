import { Popover as RadixPopover } from 'radix-ui';
import React, { useState } from 'react';

import { TEditorConfiguration } from '../../../../editor/types';
import { TemplatesMenu } from '../../../templateLibrary';
import { generateBlockId } from '../../blockChildren';

import BlocksMenu from './BlocksMenu';
import DividerButton from './DividerButton';
import PlaceholderButton from './PlaceholderButton';

/**
 * What the menu emits: one block, or a whole template already renumbered.
 * Either way it is blocks keyed by id plus which of them goes into the
 * children list at this point.
 */
export type TBlockInsertion = {
  blockId: string;
  blocks: TEditorConfiguration;
};

type Props = {
  placeholder?: boolean;
  onSelect: (insertion: TBlockInsertion) => void;
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

  const handleSelect = (insertion: TBlockInsertion) => {
    onSelect(insertion);
    setOpen(false);
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
              const blockId = generateBlockId();
              handleSelect({ blockId, blocks: { [blockId]: block } });
            }}
          />
          <TemplatesMenu onSelect={handleSelect} />
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
