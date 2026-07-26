import { Plus } from 'lucide-react';
import React from 'react';

type Props = {
  onClick: () => void;
};
export default function PlaceholderButton({ onClick }: Props) {
  return (
    <button
      type="button"
      aria-label="Add block"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
      className="flex h-12 w-full items-center justify-center bg-black/5"
    >
      <Plus className="size-5 rounded-full bg-brand-blue p-[1px] text-white" />
    </button>
  );
}
