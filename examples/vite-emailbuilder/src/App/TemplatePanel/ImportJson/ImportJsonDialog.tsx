import React, { useState } from 'react';

import { resetDocument } from '../../../documents/editor/EditorContext';
import Button from '../../../ui/Button';
import Dialog, { DialogActions, DialogContent } from '../../../ui/Dialog';
import TextField from '../../../ui/TextField';

import validateJsonStringValue from './validateJsonStringValue';

type ImportJsonDialogProps = {
  onClose: () => void;
};
export default function ImportJsonDialog({ onClose }: ImportJsonDialogProps) {
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
        {error}
      </div>
    );
  }

  return (
    <Dialog title="Import JSON" onClose={onClose}>
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
            Copy and paste an EmailBuilder.js JSON (
            <a
              className="text-brand-blue hover:underline"
              href="https://gist.githubusercontent.com/jordanisip/efb61f56ba71bd36d3a9440122cb7f50/raw/30ea74a6ac7e52ebdc309bce07b71a9286ce2526/emailBuilderTemplate.json"
              target="_blank"
            >
              example
            </a>
            ).
          </p>
          {errorAlert}
          <TextField
            error={error !== null}
            value={value}
            onChange={handleChange}
            helperText="This will override your current template."
            rows={10}
          />
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="contained" type="submit" disabled={error !== null}>
            Import
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
