import React from 'react';

import cn from './cn';

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-full p-2 text-txt-primary transition-colors ' +
  'hover:bg-black/4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue ' +
  'disabled:pointer-events-none disabled:opacity-60';

type Props = { className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>;

const IconButton = React.forwardRef<HTMLButtonElement, Props>(function IconButton({ className, ...props }, ref) {
  return <button ref={ref} type="button" className={cn(BASE, className)} {...props} />;
});

export default IconButton;

type LinkProps = { className?: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const IconLinkButton = React.forwardRef<HTMLAnchorElement, LinkProps>(function IconLinkButton(
  { className, ...props },
  ref
) {
  return <a ref={ref} className={cn(BASE, className)} {...props} />;
});
