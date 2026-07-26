import { Toast as RadixToast } from 'radix-ui';
import React from 'react';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <RadixToast.Provider swipeDirection="up">
      {children}
      {/* MUI's Snackbar defaulted to top-center here. */}
      <RadixToast.Viewport className="fixed top-0 left-1/2 z-100 flex w-auto -translate-x-1/2 flex-col gap-2 p-6 outline-none" />
    </RadixToast.Provider>
  );
}

type Props = {
  message: string | null;
  onClose: () => void;
};

export default function Toast({ message, onClose }: Props) {
  return (
    <RadixToast.Root
      open={message !== null}
      onOpenChange={(open) => !open && onClose()}
      className="rounded-sm bg-[#323232] px-4 py-3.5 text-body1 text-white shadow-e3"
    >
      <RadixToast.Description>{message}</RadixToast.Description>
    </RadixToast.Root>
  );
}
