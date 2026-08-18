import React from 'react';

import { useTranslate } from '../i18n';
import { TEditorConfiguration } from '../types';

import { useTemplateLibrary } from './context';
import { instantiateBlockTemplate, isBlockTemplateContent, templateBlockCount, templateKey } from './helpers';
import { TBlockTemplate } from './types';
import { useIsTemplateSupported } from './useInsertBlockTemplate';

export type TTemplateInsertion = {
  /** The fragment's new root, to go into the children list at this point. */
  blockId: string;
  /** The whole fragment under fresh ids, to merge into the document. */
  blocks: TEditorConfiguration;
};

type Props = {
  onSelect: (insertion: TTemplateInsertion) => void;
};

/**
 * The saved partials, offered in the add-block popover under the block grid —
 * the only way to place one at an exact point rather than after the selection.
 * Renders nothing when the library holds none, so the menu is unchanged for a
 * host that only wired up `save`.
 */
export default function TemplatesMenu({ onSelect }: Props) {
  const t = useTranslate();
  const library = useTemplateLibrary();
  const isSupported = useIsTemplateSupported();

  const templates = (library?.templates ?? []).filter(
    (template) => isBlockTemplateContent(template) && isSupported(template)
  );
  if (templates.length === 0) {
    return null;
  }

  const handleClick = (template: TBlockTemplate) => onSelect(instantiateBlockTemplate(template));

  return (
    <div className="max-h-64 overflow-auto border-t border-divider p-2">
      <p className="px-1 pb-1 text-overline text-txt-secondary">{t('templates.title')}</p>
      {templates.map((template) => (
        <button
          key={templateKey(template)}
          type="button"
          className="flex w-full cursor-pointer items-center gap-2 rounded-sm p-2 text-left transition-colors hover:bg-black/4"
          onClick={(ev) => {
            ev.stopPropagation();
            handleClick(template);
          }}
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-sm border border-cadet-300 bg-cadet-200 text-body2 text-txt-secondary">
            {templateBlockCount(template)}
          </span>
          <span className="min-w-0 flex-1 truncate text-body2">{template.name}</span>
        </button>
      ))}
    </div>
  );
}
