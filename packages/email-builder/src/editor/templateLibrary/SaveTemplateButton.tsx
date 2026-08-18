import { BookmarkPlus } from 'lucide-react';
import React, { useState } from 'react';

import { useDocument } from '../EditorContext';
import { useTranslate } from '../i18n';
import Button from '../ui/Button';
import Dialog, { DialogActions, DialogContent } from '../ui/Dialog';
import IconButton from '../ui/IconButton';
import TextField from '../ui/TextField';
import Tooltip from '../ui/Tooltip';

import { useTemplateLibrary } from './context';
import { extractBlockTemplate } from './helpers';

type Props = {
  blockId: string;
};

/**
 * Keeps a block and everything under it as a reusable partial. Rendered in
 * `TuneMenu`, so it is one of the block's own controls — and only when the host
 * gave the provider a library that can save.
 *
 * What the host gets is a plain JSON fragment; what it does with it, and
 * whether it ever comes back in `templates`, is entirely its business.
 */
export default function SaveTemplateButton({ blockId }: Props) {
  const t = useTranslate();
  const library = useTemplateLibrary();
  const document = useDocument();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = library?.save;
  if (!save) {
    return null;
  }

  const close = () => {
    setOpen(false);
    setName('');
    setError(null);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed === '') {
      setError(t('templates.error.name'));
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await save({
        ...extractBlockTemplate(document, blockId),
        name: trimmed,
        blockType: document[blockId].type,
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('templates.error.save'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Tooltip title={t('templates.saveAs')} side="left" align="start">
        <IconButton onClick={() => setOpen(true)} aria-label={t('templates.saveAs')}>
          <BookmarkPlus className="size-5" />
        </IconButton>
      </Tooltip>
      {open && (
        <Dialog title={t('templates.saveTitle')} onClose={close}>
          <DialogContent>
            <TextField
              label={t('templates.name')}
              placeholder={t('templates.namePlaceholder')}
              value={name}
              autoFocus
              error={error !== null}
              helperText={error === null ? undefined : <span className="text-brand-red">{error}</span>}
              onChange={(ev) => {
                setName(ev.target.value);
                setError(null);
              }}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter') {
                  ev.preventDefault();
                  void handleSave();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={close} disabled={saving}>
              {t('templates.cancel')}
            </Button>
            <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
              {saving ? t('templates.saving') : t('templates.save')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
}
