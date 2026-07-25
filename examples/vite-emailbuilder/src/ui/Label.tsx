import React from 'react';

import cn from './cn';

type Props = {
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * The old MUI `<InputLabel shrink>`: a small, medium-weight, secondary caption
 * sitting above its control rather than floating inside it.
 */
export default function Label({ htmlFor, className, children }: Props) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-[13px] font-medium text-txt-secondary', className)}>
      {children}
    </label>
  );
}
