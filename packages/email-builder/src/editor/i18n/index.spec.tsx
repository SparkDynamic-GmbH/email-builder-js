import React from 'react';
import { z } from 'zod';

import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import buildBlockRegistry from '../../core/builders/buildBlockRegistry';
import { BlockDefinitionDictionary } from '../../core/registry';
import { EmailBuilderProvider } from '../EditorContext';
import SaveButton from '../SaveButton';

import { CATALOGS, createTranslate, useTranslate } from '.';
import en from './en';

describe('createTranslate', () => {
  it('resolves in the requested language', () => {
    expect(createTranslate('en')('save.save')).toBe('Save');
    expect(createTranslate('de')('save.save')).toBe('Speichern');
  });

  it('fills placeholders', () => {
    expect(createTranslate('en')('field.column', { number: 2 })).toBe('Column 2');
    expect(createTranslate('de')('field.column', { number: 2 })).toBe('Spalte 2');
  });

  it('leaves a placeholder it has no value for alone', () => {
    expect(createTranslate('en')('field.column', {})).toBe('Column {number}');
  });

  it('prefers a host override, and falls back to the catalog without one', () => {
    const t = createTranslate('de', { 'save.save': 'Sichern' });
    expect(t('save.save')).toBe('Sichern');
    expect(t('save.saved')).toBe('Gespeichert');
  });

  it('resolves a key of the host’s own', () => {
    expect(createTranslate('de', { 'block.MyBlock': 'Mein Block' })('block.MyBlock')).toBe('Mein Block');
  });

  it('returns an unknown key unchanged, so a caller can detect it', () => {
    expect(createTranslate('en')('block.MyBlock')).toBe('block.MyBlock');
  });
});

describe('catalogs', () => {
  it.each(Object.keys(CATALOGS))('%s covers the same keys as English', (language) => {
    expect(Object.keys(CATALOGS[language as keyof typeof CATALOGS]).sort()).toEqual(Object.keys(en).sort());
  });
});

const TextSchema = z.object({ text: z.string() });
const registry = buildBlockRegistry({
  Text: {
    schema: TextSchema,
    Reader: ({ text }) => <div>{text}</div>,
  },
} satisfies BlockDefinitionDictionary<{ Text: typeof TextSchema }>);
const DOCUMENT = { root: { type: 'Text' as const, data: { text: 'a' } } };

function Probe() {
  return <span data-testid="probe">{useTranslate()('inspector.tab.styles')}</span>;
}

describe('EmailBuilderProvider language', () => {
  it('defaults to English', () => {
    render(
      <EmailBuilderProvider registry={registry} initialDocument={DOCUMENT}>
        <Probe />
      </EmailBuilderProvider>
    );
    expect(screen.getByTestId('probe').textContent).toBe('Styles');
  });

  it('publishes the language to everything below it', () => {
    render(
      <EmailBuilderProvider registry={registry} initialDocument={DOCUMENT} language="de" onSave={() => {}}>
        <Probe />
        <SaveButton />
      </EmailBuilderProvider>
    );
    expect(screen.getByTestId('probe').textContent).toBe('Stile');
    // Saved, not dirty — the document is the one the provider started with.
    expect(screen.getByRole('button').textContent).toContain('Gespeichert');
  });
});
