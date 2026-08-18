import { Check, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { useDocument, useEditorActions, useEditorRegistry } from '../EditorContext';
import { useTranslate } from '../i18n';
import Button from '../ui/Button';
import Dialog, { DialogActions, DialogContent } from '../ui/Dialog';
import IconButton from '../ui/IconButton';
import Switch from '../ui/Switch';
import TextField from '../ui/TextField';
import Tooltip from '../ui/Tooltip';

import { useStylePresets } from './context';
import { applyStylePreset, extractStylePreset, stylePresetKey } from './helpers';
import { TStylePreset } from './types';

/** Stands in for a preset the host gave no thumbnail for: its two page colours. */
function PresetSwatch({ preset }: { preset: TStylePreset }) {
  if (preset.thumbnailUrl) {
    return <img src={preset.thumbnailUrl} alt="" className="size-10 shrink-0 rounded-sm object-cover" />;
  }
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-divider"
      style={{ backgroundColor: preset.layout?.backdropColor ?? '#F5F5F5' }}
    >
      <span
        className="size-5 rounded-xs border border-black/10"
        style={{ backgroundColor: preset.layout?.canvasColor ?? '#FFFFFF' }}
      />
    </span>
  );
}

/**
 * The named stylings, as the sidebar's Presets tab. Like the template library
 * it is the host's own array rendered as it comes — the editor keeps no copy,
 * so a host that saves and then updates its state sees the new entry appear.
 *
 * Applying one is a single document write, so it is one undo step. It merges
 * into the document's block defaults rather than replacing them, so a preset
 * that themes two block types leaves the rest as they were. Whether it also
 * restyles the blocks already on the canvas is asked in the dialog rather than
 * assumed: a restyle overwrites styling the user may have set on a block
 * deliberately, and undo is a thin thing to hang that on.
 */
export default function StylePresetPanel() {
  const t = useTranslate();
  const library = useStylePresets();
  const registry = useEditorRegistry();
  const document = useDocument();
  const { setDocument } = useEditorActions();

  const [applying, setApplying] = useState<TStylePreset | null>(null);
  const [restyle, setRestyle] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  if (!library) {
    return null;
  }
  const presets = library.presets ?? [];

  const apply = () => {
    if (applying) {
      setDocument(applyStylePreset(registry, document, applying, { restyleExistingBlocks: restyle }));
    }
    setApplying(null);
  };

  const closeSave = () => {
    setSaveOpen(false);
    setName('');
    setError(null);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (trimmed === '') {
      setError(t('stylePresets.error.name'));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await library.save?.(extractStylePreset(document, trimmed));
      closeSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('stylePresets.error.save'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (preset: TStylePreset) => {
    setRemoveError(null);
    try {
      await library.remove?.(preset);
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : t('stylePresets.error.remove'));
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-overline text-txt-secondary">{t('stylePresets.title')}</p>
      <p className="text-body2 text-txt-secondary">{t('stylePresets.helper')}</p>

      {removeError !== null && (
        <p role="alert" className="text-body2 text-brand-red">
          {removeError}
        </p>
      )}

      {presets.length === 0 ? (
        <div className="my-2 border border-dashed border-divider p-2">
          <p className="text-body1 text-txt-secondary">{t('stylePresets.empty')}</p>
        </div>
      ) : (
        presets.map((preset) => (
          <div
            key={stylePresetKey(preset)}
            className="flex items-center gap-2 rounded-sm border border-divider p-2 transition-colors hover:border-grey-500"
          >
            <button
              type="button"
              aria-label={t('stylePresets.apply', { name: preset.name })}
              onClick={() => {
                setRestyle(false);
                setApplying(preset);
              }}
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
            >
              <PresetSwatch preset={preset} />
              <span className="min-w-0">
                <span className="block truncate text-body1">{preset.name}</span>
                {preset.description && (
                  <span className="block truncate text-body2 text-txt-secondary">{preset.description}</span>
                )}
              </span>
            </button>
            {library.remove && !preset.readOnly && (
              <Tooltip title={t('stylePresets.remove')} side="left">
                <IconButton
                  aria-label={t('stylePresets.delete', { name: preset.name })}
                  onClick={() => void handleRemove(preset)}
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        ))
      )}

      {library.save && (
        <Button size="small" variant="outlined" className="mt-1 self-start" onClick={() => setSaveOpen(true)}>
          {t('stylePresets.saveAs')}
        </Button>
      )}

      {applying && (
        <Dialog title={t('stylePresets.applyTitle', { name: applying.name })} onClose={() => setApplying(null)}>
          <DialogContent>
            <p className="mb-4 text-body1 text-txt-secondary">{t('stylePresets.applyBody')}</p>
            <Switch label={t('stylePresets.restyle')} checked={restyle} onCheckedChange={setRestyle} />
            <p className="mt-2 text-body2 text-txt-secondary">{t('stylePresets.restyleHelper')}</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplying(null)}>{t('stylePresets.cancel')}</Button>
            <Button variant="contained" onClick={apply}>
              <Check className="size-4" />
              {t('stylePresets.applyConfirm')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {saveOpen && (
        <Dialog title={t('stylePresets.saveTitle')} onClose={closeSave}>
          <DialogContent>
            <p className="mb-4 text-body2 text-txt-secondary">{t('stylePresets.saveBody')}</p>
            <TextField
              label={t('stylePresets.name')}
              placeholder={t('stylePresets.namePlaceholder')}
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
            <Button onClick={closeSave} disabled={saving}>
              {t('stylePresets.cancel')}
            </Button>
            <Button variant="contained" onClick={() => void handleSave()} disabled={saving}>
              {saving ? t('stylePresets.saving') : t('stylePresets.save')}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
