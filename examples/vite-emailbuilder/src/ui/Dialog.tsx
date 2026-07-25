import { Dialog as RadixDialog } from 'radix-ui';
import React from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

/** Always-open dialog; call sites mount and unmount it, as they did with MUI. */
export default function Dialog({ title, onClose, children }: Props) {
  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <RadixDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-64px)] max-w-[600px] -translate-1/2 rounded-sm bg-white shadow-e4">
          <RadixDialog.Title className="px-6 pt-6 pb-2 text-[20px] leading-normal font-medium tracking-[-0.01em]">
            {title}
          </RadixDialog.Title>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export function DialogContent({ children }: { children: React.ReactNode }) {
  return <div className="px-6 pt-1 pb-4">{children}</div>;
}

export function DialogActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 flex justify-end gap-2 border-t border-divider px-6 py-3">{children}</div>;
}
