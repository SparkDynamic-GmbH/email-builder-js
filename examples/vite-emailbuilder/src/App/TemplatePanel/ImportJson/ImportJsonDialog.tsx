import React, { useState } from 'react';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
  useEditorActions,
  useTranslate,
} from '@sparkdynamic/email-builder/editor';

import validateJsonStringValue from './validateJsonStringValue';

const EXAMPLE_HREF =
  'https://gist.githubusercontent.com/jordanisip/efb61f56ba71bd36d3a9440122cb7f50/raw/30ea74a6ac7e52ebdc309bce07b71a9286ce2526/emailBuilderTemplate.json';

type ImportJsonDialogProps = {
  onClose: () => void;
};
export default function ImportJsonDialog({ onClose }: ImportJsonDialogProps) {
  const t = useTranslate();
  const { resetDocument } = useEditorActions();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (ev) => {
    const v = ev.currentTarget.value;
    setValue(v);
    const { error } = validateJsonStringValue(v);
    setError(error ?? null);
  };

  let errorAlert = null;
  if (error) {
    errorAlert = (
      <div role="alert" className="mb-2 rounded-sm bg-brand-red/8 px-4 py-3 text-body1 text-brand-red">
        {t(error)}
      </div>
    );
  }

  // The link sits inside the sentence, so the copy carries an `{example}` slot
  // and the two halves are rendered around it.
  const [beforeLink, afterLink] = t('app.import.body').split('{example}');

  return (
    <Dialog title={t('app.import')} onClose={onClose}>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          const { error, data } = validateJsonStringValue(value);
          setError(error ?? null);
          if (!data) {
            return;
          }
          resetDocument(data);
          onClose();
        }}
      >
        <DialogContent>
          <p className="mb-4 text-body1 text-txt-secondary">
            {beforeLink}
            <a className="text-brand-blue hover:underline" href={EXAMPLE_HREF} target="_blank">
              {t('app.import.example')}
            </a>
            {afterLink}
          </p>
          {errorAlert}
          <TextField
            error={error !== null}
            value={value}
            onChange={handleChange}
            helperText={t('app.import.helper')}
            rows={10}
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose}>
            {t('app.import.cancel')}
          </Button>
          <Button variant="contained" type="submit" disabled={error !== null}>
            {t('app.import.confirm')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
