import { Redo2, Undo2 } from 'lucide-react';
import React from 'react';

import { useCanRedo, useCanUndo, useEditorActions } from './EditorContext';
import { useTranslate } from './i18n';
import IconButton from './ui/IconButton';

type Props = {
  className?: string;
};

/**
 * Steps the document back and forward through the provider's history. Drop it
 * anywhere in the host's chrome; the keyboard shortcuts work with or without it.
 *
 * The labels go on the native `title`, not our Tooltip — that one is Radix, and
 * would make every host wrap its toolbar in a TooltipProvider.
 */
export default function UndoRedoButtons({ className }: Props) {
  const t = useTranslate();
  const { undo, redo } = useEditorActions();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  return (
    <div className={className}>
      <IconButton onClick={undo} disabled={!canUndo} title={t('history.undo')} aria-label={t('history.undo')}>
        <Undo2 className="size-5" />
      </IconButton>
      <IconButton onClick={redo} disabled={!canRedo} title={t('history.redo')} aria-label={t('history.redo')}>
        <Redo2 className="size-5" />
      </IconButton>
    </div>
  );
}
