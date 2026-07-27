import { Check, LoaderCircle, TriangleAlert } from 'lucide-react';
import React from 'react';

import { useCanSave, useEditorActions, useIsDirty, useSaveError, useSaveStatus } from './EditorContext';
import { useTranslate } from './i18n';
import Button from './ui/Button';

type Props = {
  /** Overrides the resting label. Saving / saved / failed states keep theirs. */
  label?: string;
  size?: 'small' | 'medium';
  className?: string;
};

/**
 * Saves the document through the provider's `onSave`, and reports where that
 * got to. Renders nothing when the provider was given no `onSave`, so a
 * read-only or autosave-only host can drop it in unconditionally.
 */
export default function SaveButton({ label, size = 'medium', className }: Props) {
  const t = useTranslate();
  const canSave = useCanSave();
  const { save } = useEditorActions();
  const status = useSaveStatus();
  const error = useSaveError();
  const isDirty = useIsDirty();

  if (!canSave) {
    return null;
  }

  // Dirty beats status: a save that succeeded before the latest edit is not
  // "Saved" any more, and one that failed is still worth retrying.
  const state = status === 'saving' ? 'saving' : status === 'error' ? 'error' : isDirty ? 'dirty' : 'saved';

  switch (state) {
    case 'saving':
      return (
        <Button variant="contained" size={size} className={className} disabled>
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          {t('save.saving')}
        </Button>
      );
    case 'error':
      // The native title, not our Tooltip: that one is Radix, and would make
      // every host wrap its toolbar in a TooltipProvider to render this button.
      return (
        <Button
          variant="outlined"
          size={size}
          className={className}
          onClick={() => void save()}
          title={error?.message ? t(error.message) : t('save.failed')}
        >
          <TriangleAlert className="size-4 text-brand-red" aria-hidden />
          {t('save.retry')}
        </Button>
      );
    case 'saved':
      return (
        <Button variant="text" size={size} className={className} disabled>
          <Check className="size-4" aria-hidden />
          {t('save.saved')}
        </Button>
      );
    case 'dirty':
      return (
        <Button variant="contained" size={size} className={className} onClick={() => void save()}>
          {label ?? t('save.save')}
        </Button>
      );
  }
}
