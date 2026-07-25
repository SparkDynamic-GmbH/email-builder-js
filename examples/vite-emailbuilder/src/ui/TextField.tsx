import React, { useId } from 'react';

import cn from './cn';
import Label from './Label';

/**
 * The border lives on the wrapper rather than the control itself so that an
 * end adornment (the "px" suffix on dimension inputs) sits *inside* the
 * underline, the way MUI's InputAdornment did.
 */
const WRAPPER_BASE = 'flex w-full items-baseline gap-1 transition-colors';

/** MUI's `variant="standard"` — a single underline that darkens on hover/focus. */
const STANDARD = 'border-b border-grey-400 py-1 hover:border-grey-500 focus-within:border-txt-primary';

/** MUI's `variant="outlined"` — used for the multiline inputs. */
const OUTLINED = 'rounded-sm border border-grey-300 p-2 hover:border-grey-400 focus-within:border-txt-secondary';

const CONTROL = 'w-full bg-transparent text-body1 text-txt-primary outline-none placeholder:text-grey-500';

type Props = {
  label?: string;
  helperText?: React.ReactNode;
  error?: boolean;
  /** >1 renders a textarea with the outlined look, matching the old behaviour. */
  rows?: number;
  endAdornment?: React.ReactNode;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>, 'rows'>;

export default function TextField({ label, helperText, error, rows, endAdornment, className, ...props }: Props) {
  const id = useId();
  const isMultiline = typeof rows === 'number' && rows > 1;
  const errorBorder = 'border-brand-red hover:border-brand-red focus-within:border-brand-red';

  return (
    <div className={cn('flex w-full flex-col gap-1', className)}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className={cn(WRAPPER_BASE, isMultiline ? OUTLINED : STANDARD, error && errorBorder)}>
        {isMultiline ? (
          <textarea id={id} rows={rows} className={cn(CONTROL, 'resize-y')} {...props} />
        ) : (
          <input id={id} className={CONTROL} {...props} />
        )}
        {endAdornment && <span className="shrink-0 text-body1 text-txt-secondary">{endAdornment}</span>}
      </div>
      {helperText && <p className="text-body2 text-txt-secondary">{helperText}</p>}
    </div>
  );
}
