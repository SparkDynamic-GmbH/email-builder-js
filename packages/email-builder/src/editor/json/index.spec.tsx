import React from 'react';

import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import buildBlockRegistry from '../../core/builders/buildBlockRegistry';
import BUILT_IN_BLOCK_DEFINITIONS from '../definitions';
import { EmailBuilderProvider, useDocument } from '../EditorContext';
import EditorBlockWrapper from '../helpers/block-wrappers/EditorBlockWrapper';
import { TooltipProvider } from '../ui/Tooltip';

import { documentToJson, parseDocumentJson } from './helpers';
import ImportJsonDialog from './ImportJsonDialog';

const REGISTRY = buildBlockRegistry(BUILT_IN_BLOCK_DEFINITIONS, { EditorBlockWrapper });

const DOCUMENT = {
  root: { type: 'EmailLayout' as const, data: { childrenIds: ['heading'] } },
  heading: { type: 'Heading' as const, data: { props: { text: 'Hello' } } },
};

describe('helpers', () => {
  it('writes JSON the parser reads back', () => {
    const { document, error } = parseDocumentJson(documentToJson(DOCUMENT), REGISTRY.documentSchema);
    expect(error).toBeUndefined();
    expect(document).toEqual(DOCUMENT);
  });

  it('separates unparseable text from a document the registry cannot open', () => {
    expect(parseDocumentJson('{', REGISTRY.documentSchema).error).toBe('json.error.invalidJson');
    expect(parseDocumentJson('{"root":{"type":"Nope","data":{}}}', REGISTRY.documentSchema).error).toBe(
      'json.error.invalidSchema'
    );
  });

  it('refuses a document with nothing to render from', () => {
    const json = JSON.stringify({ heading: DOCUMENT.heading });
    expect(parseDocumentJson(json, REGISTRY.documentSchema).error).toBe('json.error.missingRoot');
  });
});

function DocumentProbe() {
  return <pre data-testid="document">{documentToJson(useDocument())}</pre>;
}

function renderDialog(onClose = () => {}) {
  return render(
    <TooltipProvider>
      <EmailBuilderProvider registry={REGISTRY} initialDocument={{ root: DOCUMENT.root }}>
        <DocumentProbe />
        <ImportJsonDialog onClose={onClose} />
      </EmailBuilderProvider>
    </TooltipProvider>
  );
}

describe('ImportJsonDialog', () => {
  it('replaces the document with the pasted one', () => {
    renderDialog();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: documentToJson(DOCUMENT) } });
    fireEvent.click(screen.getByRole('button', { name: 'Import' }));

    expect(JSON.parse(screen.getByTestId('document').textContent ?? '')).toEqual(DOCUMENT);
  });

  it('reports invalid JSON and leaves the document alone', () => {
    renderDialog();

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'not json' } });

    expect(screen.getByRole('alert').textContent).toBe('This is not valid JSON.');
    expect((screen.getByRole('button', { name: 'Import' }) as HTMLButtonElement).disabled).toBe(true);
    expect(JSON.parse(screen.getByTestId('document').textContent ?? '')).toEqual({ root: DOCUMENT.root });
  });
});
