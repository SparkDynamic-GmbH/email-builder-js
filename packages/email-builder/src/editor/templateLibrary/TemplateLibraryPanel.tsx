import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { useTranslate } from '../i18n';
import IconButton from '../ui/IconButton';

import { useTemplateLibrary } from './context';
import { isBlockTemplateContent, templateBlockCount, templateKey } from './helpers';
import { TBlockTemplate } from './types';
import useInsertBlockTemplate, { useIsTemplateSupported } from './useInsertBlockTemplate';

/**
 * The saved partials, as the sidebar's third tab. The list is the host's
 * `templates` array rendered as it comes — the editor keeps no copy of it, so a
 * host that saves and then updates its own state sees the new entry appear.
 *
 * Clicking one inserts it after the selected block, or at the end of the
 * document when nothing is selected.
 */
export default function TemplateLibraryPanel() {
  const t = useTranslate();
  const library = useTemplateLibrary();
  const insert = useInsertBlockTemplate();
  const isSupported = useIsTemplateSupported();
  const [error, setError] = useState<string | null>(null);

  const templates = (library?.templates ?? []).filter((template) => isBlockTemplateContent(template));

  if (templates.length === 0) {
    return (
      <div className="m-6 border border-dashed border-divider p-2">
        <p className="text-body1 text-txt-secondary">{t('templates.empty')}</p>
      </div>
    );
  }

  const handleInsert = (template: TBlockTemplate) => {
    setError(insert(template) === null ? t('templates.error.insert') : null);
  };

  const handleRemove = async (template: TBlockTemplate) => {
    if (!library?.remove) {
      return;
    }
    setError(null);
    try {
      await library.remove(template);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('templates.error.remove'));
    }
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <p className="text-overline text-txt-secondary">{t('templates.title')}</p>
      {error !== null && (
        <p role="alert" className="text-body2 text-brand-red">
          {error}
        </p>
      )}
      {templates.map((template) => {
        const supported = isSupported(template);
        return (
          <div
            key={templateKey(template)}
            className="flex items-center gap-2 rounded-sm border border-divider p-2 transition-colors hover:border-grey-500"
          >
            <button
              type="button"
              className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-left disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!supported}
              title={supported ? undefined : t('templates.unsupported')}
              aria-label={t('templates.insert', { name: template.name })}
              onClick={() => handleInsert(template)}
            >
              {template.thumbnailUrl ? (
                <img src={template.thumbnailUrl} alt="" className="size-10 shrink-0 rounded-sm object-cover" />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-cadet-300 bg-cadet-200 text-body2 text-txt-secondary">
                  {templateBlockCount(template)}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-body1">{template.name}</span>
                <span className="block truncate text-body2 text-txt-secondary">
                  {supported
                    ? template.description ?? template.blocks[template.rootBlockId].type
                    : t('templates.unsupported')}
                </span>
              </span>
            </button>
            {library?.remove && (
              <IconButton
                aria-label={t('templates.delete', { name: template.name })}
                onClick={() => void handleRemove(template)}
              >
                <Trash2 className="size-4" />
              </IconButton>
            )}
          </div>
        );
      })}
    </div>
  );
}
