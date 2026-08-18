import React, { useState } from 'react';

import { useDocument, useEditorActions, useEditorRegistry } from '../EditorContext';
import { useTranslate } from '../i18n';
import Accordion, { AccordionItem } from '../ui/Accordion';
import Button from '../ui/Button';

import { getBlockDefaults, resolveNewBlock, setBlockDefault } from './helpers';
import useExternalRevision from './useExternalRevision';

/**
 * Edits what each block type starts from, using each block's own inspector
 * panel against a stand-in block rather than a second set of inputs: whatever
 * you can set on a Text block you can set as the default for every Text block,
 * and a host's own block gets the same treatment for free.
 *
 * Only types the add-block menu offers are listed — a block the user cannot
 * insert has no "when it is added" to configure.
 */
export default function BlockDefaultsPanel() {
  const t = useTranslate();
  const { setDocument } = useEditorActions();
  const registry = useEditorRegistry();
  const document = useDocument();
  const [open, setOpen] = useState('');
  // The raw field, not `getBlockDefaults`, whose `{}` for "none stored" would be
  // a new object on every render and so read as an external change every time.
  const [revision, markOwnWrite] = useExternalRevision(document.root?.data?.blockDefaults);

  const defaults = getBlockDefaults(document);

  // Same convention as the add-block menu: `block.<type>`, falling back to the
  // label the definition gave when a host's block has no catalog entry.
  const labelOf = (type: string, label: string) => {
    const key = `block.${type}`;
    const translated = t(key);
    return translated === key ? label : translated;
  };

  const write = (type: string, data: unknown) => {
    const next = setBlockDefault(document, type, data);
    markOwnWrite(next.root?.data?.blockDefaults);
    setDocument(next);
  };

  const entries = registry.menu.filter(({ type }) => registry.definitions[type]?.SidebarPanel);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-divider p-4">
      <p className="mb-1 block text-overline text-txt-secondary">{t('styleDefaults.title')}</p>
      <p className="mb-3 text-body2 text-txt-secondary">{t('styleDefaults.helper')}</p>
      <Accordion value={open} onValueChange={setOpen}>
        {entries.map(({ type, label, block }) => {
          const isCustomised = defaults[type] !== undefined && defaults[type] !== null;
          return (
            <AccordionItem
              key={type}
              value={type}
              label={
                <span className="flex items-center gap-2">
                  {labelOf(type, label)}
                  {isCustomised && <span className="size-1.5 rounded-full bg-brand-blue" />}
                </span>
              }
            >
              <registry.SidebarPanel
                key={`${type}-${revision}`}
                block={resolveNewBlock(registry, document, block())}
                setBlock={({ data }) => write(type, data)}
              />
              {isCustomised && (
                <div className="px-4 pb-4">
                  <Button size="small" variant="outlined" onClick={() => write(type, undefined)}>
                    {t('styleDefaults.reset')}
                  </Button>
                </div>
              )}
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
