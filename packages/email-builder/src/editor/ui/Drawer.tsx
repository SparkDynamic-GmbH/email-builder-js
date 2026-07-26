import React from 'react';

import cn from './cn';

type Props = {
  anchor: 'left' | 'right';
  open: boolean;
  width: number;
  className?: string;
  children: React.ReactNode;
};

/**
 * MUI's `variant="persistent"` drawer: it stays in the layout and slides out of
 * view when closed, rather than unmounting behind a modal backdrop. App/index
 * pairs this with a matching margin on the main panel.
 */
export default function Drawer({ anchor, open, width, className, children }: Props) {
  const hidden = anchor === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
  return (
    <aside
      className={cn(
        'fixed top-0 z-30 h-full overflow-hidden bg-white shadow-e2',
        anchor === 'left' ? 'left-0' : 'right-0',
        className
      )}
      style={{
        width,
        transform: open ? 'translateX(0)' : hidden,
        transition: open ? 'transform 225ms var(--ease-out)' : 'transform 195ms var(--ease-sharp)',
      }}
      aria-hidden={!open}
    >
      {children}
    </aside>
  );
}
