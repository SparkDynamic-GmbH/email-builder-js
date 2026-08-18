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
    return <img src={preset.thumbnailUrl} alt="" className="size-9 shrink-0 rounded-sm object-cover" />;
  }
  return (
    <span
      className="flex size-9 shrink-0 items-center justify-center rounded-sm border border-divider"
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
 * The named stylings at the top of the Styles tab.
 *
 * Applying one is a single document write, so it is one undo step. It merges
 * into the document's block defaults rather than replacing them, so a preset
 * that themes two block types leaves the rest as they were. Whether it also
 * restyles the blocks already on the canvas is asked in the dialog rather than
 * assumed: a restyle overwrites styling the user may have set on a block
 * deliberately, and undo is a thin thing to hang that on.
 */
export default function StylePresetPicker() {
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

  return (
    <div className="border-b border-divider p-4">
      <p className="mb-1 block text-overline text-txt-secondary">{t('stylePresets.title')}</p>
      <p className="mb-3 text-body2 text-txt-secondary">{t('stylePresets.helper')}</p>

      {presets.length === 0 ? (
        <p className="text-body2 text-txt-secondary">{t('stylePresets.empty')}</p>
      ) : (
        <ul className="flex flex-col">
          {presets.map((preset) => (
            <li
              key={stylePresetKey(preset)}
              className="flex items-center gap-3 border-b border-divider py-2 last:border-b-0"
            >
              <PresetSwatch preset={preset} />
              <button
                type="button"
                onClick={() => {
                  setRestyle(false);
                  setApplying(preset);
                }}
                className="flex-1 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue"
              >
                <span className="block text-body1">{preset.name}</span>
                {preset.description && (
                  <span className="block text-body2 text-txt-secondary">{preset.description}</span>
                )}
              </button>
              {library.remove && (
                <Tooltip title={t('stylePresets.remove')} side="left">
                  <IconButton aria-label={t('stylePresets.remove')} onClick={() => void library.remove?.(preset)}>
                    <Trash2 className="size-4" />
                  </IconButton>
                </Tooltip>
              )}
            </li>
          ))}
        </ul>
      )}

      {library.save && (
        <Button size="small" variant="outlined" className="mt-3" onClick={() => setSaveOpen(true)}>
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
