import React from 'react';

import cn from './cn';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-sm font-medium leading-normal transition-colors ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ' +
  'disabled:pointer-events-none disabled:opacity-60';

const VARIANTS = {
  text: 'text-txt-primary hover:bg-black/4',
  contained: 'bg-brand-blue text-white hover:bg-brand-blue/90',
  outlined: 'border border-grey-300 text-txt-primary hover:border-grey-500',
} as const;

const SIZES = {
  small: 'px-2 py-1 text-[13px]',
  medium: 'px-4 py-1.5 text-[14px]',
} as const;

type Props = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ variant = 'text', size = 'medium', className, ...props }: Props) {
  return <button type="button" className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}

type LinkProps = {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

/** Anchor styled as a button — MUI's `<Button href>` rendered an <a>, so links stay links. */
export function LinkButton({ variant = 'text', size = 'medium', className, ...props }: LinkProps) {
  return <a className={cn(BASE, VARIANTS[variant], SIZES[size], className)} {...props} />;
}
