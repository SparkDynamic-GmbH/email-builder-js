import { FileUp } from 'lucide-react';
import React, { useState } from 'react';

import { useEditorActions, useEditorRegistry } from '../EditorContext';
import { useTranslate } from '../i18n';
import Button from '../ui/Button';
import Dialog, { DialogActions, DialogContent } from '../ui/Dialog';
import TextField from '../ui/TextField';

import { parseDocumentJson } from './helpers';

type Props = {
  onClose: () => void;
  /** Called with the imported document once it has replaced the current one. */
  onImport?: (document: ReturnType<typeof parseDocumentJson>['document']) => void;
};

/**
 * Replaces the whole document with one pasted or picked as JSON. The history is
 * cleared with it: the states before an import are not steps the user took in
 * the document they now have.
 */
export default function ImportJsonDialog({ onClose, onImport }: Props) {
  const t = useTranslate();
  const registry = useEditorRegistry();
  const { resetDocument } = useEditorActions();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const update = (next: string) => {
    setValue(next);
    // Validate as it is typed, so the confirm button says up front whether this
    // will work — but an empty field is "nothing yet", not an error.
    setError(next.trim() === '' ? null : parseDocumentJson(next, registry.documentSchema).error ?? null);
  };

  const readFile = async (file: File) => {
    try {
      update(await file.text());
    } catch {
      setValue('');
      setError('json.error.file');
    }
  };

  const submit: React.FormEventHandler = (ev) => {
    ev.preventDefault();
    const result = parseDocumentJson(value, registry.documentSchema);
    if (!result.document) {
      setError(result.error);
      return;
    }

    resetDocument(result.document, { clearHistory: true });
    onImport?.(result.document);
    onClose();
  };

  return (
    <Dialog title={t('json.import')} onClose={onClose}>
      <form onSubmit={submit}>
        <DialogContent>
          <p className="mb-4 text-body1 text-txt-secondary">{t('json.import.body')}</p>

          {/* A <label> opens the picker natively on click — no JS `.click()` to flake on. */}
          <label className="mb-4 inline-flex cursor-pointer items-center gap-2 rounded-sm border border-grey-300 px-3 py-2 text-body2 text-txt-primary transition-colors hover:border-grey-400">
            <FileUp className="size-4" aria-hidden="true" />
            <span>{t('json.import.file')}</span>
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={(ev) => {
                const file = ev.target.files?.[0];
                // Reset so choosing the same file twice fires again.
                ev.target.value = '';
                if (file) {
                  void readFile(file);
                }
              }}
            />
          </label>

          {error && (
            <div role="alert" className="mb-2 rounded-sm bg-brand-red/8 px-4 py-3 text-body1 text-brand-red">
              {t(error)}
            </div>
          )}

          <TextField
            error={error !== null}
            value={value}
            onChange={(ev) => update(ev.currentTarget.value)}
            helperText={t('json.import.helper')}
            rows={10}
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose}>
            {t('json.import.cancel')}
          </Button>
          <Button variant="contained" type="submit" disabled={value.trim() === '' || error !== null}>
            {t('json.import.confirm')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
