import React from 'react';

type BlockMenuButtonProps = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
};

export default function BlockTypeButton({ label, icon, onClick }: BlockMenuButtonProps) {
  return (
    <button
      type="button"
      className="flex flex-col items-center rounded-sm p-3 transition-colors hover:bg-black/4"
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
    >
      <span className="mb-1.5 flex w-full justify-center border border-cadet-300 bg-cadet-200 p-2">{icon}</span>
      <span className="text-body2">{label}</span>
    </button>
  );
}
