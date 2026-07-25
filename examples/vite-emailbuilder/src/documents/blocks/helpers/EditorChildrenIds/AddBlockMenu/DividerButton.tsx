import { Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import cn from '../../../../../ui/cn';

type Props = {
  buttonElement: HTMLElement | null;
  onClick: () => void;
};
export default function DividerButton({ buttonElement, onClick }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function listener({ clientX, clientY }: MouseEvent) {
      if (!buttonElement) {
        return;
      }
      const rect = buttonElement.getBoundingClientRect();
      const rectY = rect.y;
      const bottomX = rect.x;
      const topX = bottomX + rect.width;

      if (Math.abs(clientY - rectY) < 20) {
        if (bottomX < clientX && clientX < topX) {
          setVisible(true);
          return;
        }
      }
      setVisible(false);
    }
    window.addEventListener('mousemove', listener);
    return () => {
      window.removeEventListener('mousemove', listener);
    };
  }, [buttonElement, setVisible]);

  return (
    <button
      type="button"
      aria-label="Add block"
      className={cn(
        'absolute top-[-12px] left-1/2 z-40 inline-flex -translate-x-[10px] rounded-full bg-brand-blue p-[1px]',
        'text-white transition-opacity duration-[225ms]',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      onClick={(ev) => {
        ev.stopPropagation();
        onClick();
      }}
    >
      <Plus className="size-5" />
    </button>
  );
}
