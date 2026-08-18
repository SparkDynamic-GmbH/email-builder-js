import React from 'react';

import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import buildBlockRegistry from '../../core/builders/buildBlockRegistry';
import BUILT_IN_BLOCK_DEFINITIONS from '../definitions';
import { EmailBuilderProvider } from '../EditorContext';
import EditorBlockWrapper from '../helpers/block-wrappers/EditorBlockWrapper';
import InspectorDrawer from '../inspector/InspectorDrawer';
import { TooltipProvider } from '../ui/Tooltip';

import {
  extractBlockTemplate,
  instantiateBlockTemplate,
  isBlockTemplateContent,
  isTemplateLibraryUsable,
  templateBlockCount,
  templateBlockTypes,
  templateKey,
} from './helpers';
import SaveTemplateButton from './SaveTemplateButton';
import { TBlockTemplate, TBlockTemplateDraft, TTemplateLibrary } from './types';

const REGISTRY = buildBlockRegistry(BUILT_IN_BLOCK_DEFINITIONS, { EditorBlockWrapper });

// Radix's Tabs measures its indicator, and jsdom has no ResizeObserver. The
// sidebar tests only care which panel renders, so an inert stub is enough.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

/**
 * root → container → [heading, text], plus a heading no container holds. The
 * `type`s are literals because the provider wants the registry's strict union,
 * not the canvas's loose `TEditorBlock`.
 */
const DOCUMENT = {
  root: { type: 'EmailLayout' as const, data: { childrenIds: ['container'] } },
  container: { type: 'Container' as const, data: { props: { childrenIds: ['heading', 'text'] } } },
  heading: { type: 'Heading' as const, data: { props: { text: 'Hello' } } },
  text: { type: 'Text' as const, data: { props: { text: 'Body' } } },
  loose: { type: 'Heading' as const, data: { props: { text: 'Elsewhere' } } },
};

describe('helpers', () => {
  it('treats a library that can neither save nor offer anything as unusable', () => {
    expect(isTemplateLibraryUsable({})).toBe(false);
    expect(isTemplateLibraryUsable({ templates: [] })).toBe(false);
    expect(isTemplateLibraryUsable({ remove: () => {} })).toBe(false);
    expect(isTemplateLibraryUsable({ save: () => {} })).toBe(true);
  });

  it('keys on the id when there is one, and the name otherwise', () => {
    expect(templateKey({ id: 'a', name: 'Hero', rootBlockId: 'x', blocks: {} })).toBe('a');
    expect(templateKey({ name: 'Hero', rootBlockId: 'x', blocks: {} })).toBe('Hero');
  });

  it('extracts the subtree and nothing else', () => {
    const template = extractBlockTemplate(DOCUMENT, 'container');
    expect(template.rootBlockId).toBe('container');
    expect(Object.keys(template.blocks).sort()).toEqual(['container', 'heading', 'text']);
    expect(templateBlockCount(template)).toBe(3);
    expect(templateBlockTypes(template).sort()).toEqual(['Container', 'Heading', 'Text']);
  });

  it('copies the extracted blocks, so later edits do not reach into the template', () => {
    const template = extractBlockTemplate(DOCUMENT, 'container');
    expect(template.blocks.heading).not.toBe(DOCUMENT.heading);
    expect(template.blocks.heading).toEqual(DOCUMENT.heading);
  });

  it('renumbers a fragment on the way back in, references included', () => {
    const template = extractBlockTemplate(DOCUMENT, 'container');
    const { blockId, blocks } = instantiateBlockTemplate(template);

    expect(Object.keys(blocks)).toHaveLength(3);
    // Nothing of the original numbering survives.
    expect(Object.keys(blocks).some((id) => id in template.blocks)).toBe(false);
    const childrenIds = blocks[blockId].data.props.childrenIds as string[];
    expect(childrenIds).toHaveLength(2);
    expect(childrenIds.every((id) => id in blocks)).toBe(true);
    expect(blocks[childrenIds[0]].data.props.text).toBe('Hello');
  });

  it('gives two insertions of one template disjoint ids', () => {
    const template = extractBlockTemplate(DOCUMENT, 'container');
    const first = instantiateBlockTemplate(template);
    const second = instantiateBlockTemplate(template);
    expect(Object.keys(first.blocks).some((id) => id in second.blocks)).toBe(false);
  });

  it('drops a reference the fragment does not carry rather than leaving it dangling', () => {
    const { blockId, blocks } = instantiateBlockTemplate({
      rootBlockId: 'container',
      blocks: {
        container: { type: 'Container', data: { props: { childrenIds: ['heading', 'gone'] } } },
        heading: DOCUMENT.heading,
      },
    });
    expect(blocks[blockId].data.props.childrenIds).toHaveLength(1);
  });

  it('rejects stored JSON that is not a fragment', () => {
    expect(isBlockTemplateContent(null)).toBe(false);
    expect(isBlockTemplateContent({ rootBlockId: 'a', blocks: {} })).toBe(false);
    expect(isBlockTemplateContent(extractBlockTemplate(DOCUMENT, 'heading'))).toBe(true);
  });
});

const TEMPLATE: TBlockTemplate = {
  id: 'hero',
  name: 'Hero',
  ...extractBlockTemplate(DOCUMENT, 'container'),
};

function renderSidebar(library?: TTemplateLibrary) {
  render(
    <TooltipProvider>
      <EmailBuilderProvider registry={REGISTRY} initialDocument={DOCUMENT} templateLibrary={library}>
        <InspectorDrawer />
      </EmailBuilderProvider>
    </TooltipProvider>
  );
}

// Radix's tab triggers activate on mousedown, not click.
const openTemplatesTab = () => fireEvent.mouseDown(screen.getByRole('tab', { name: 'Templates' }));

describe('the sidebar', () => {
  it('has no Templates tab without a library', () => {
    renderSidebar();
    expect(screen.queryByRole('tab', { name: 'Templates' })).toBeNull();
  });

  it('lists what the host handed back', () => {
    renderSidebar({ templates: [TEMPLATE] });
    openTemplatesTab();
    expect(screen.getByRole('button', { name: 'Insert Hero' })).toBeTruthy();
  });

  it('offers a template with an unknown block as unavailable', () => {
    renderSidebar({
      templates: [{ id: 'x', name: 'Odd', rootBlockId: 'a', blocks: { a: { type: 'NotRegistered', data: {} } } }],
    });
    openTemplatesTab();
    expect((screen.getByRole('button', { name: 'Insert Odd' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('deletes through the host', async () => {
    const remove = jest.fn<(template: TBlockTemplate) => void>();
    renderSidebar({ templates: [TEMPLATE], remove });
    openTemplatesTab();
    fireEvent.click(screen.getByRole('button', { name: 'Delete Hero' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(TEMPLATE));
  });

  it('has no delete affordance when the host cannot delete', () => {
    renderSidebar({ templates: [TEMPLATE], save: () => {} });
    openTemplatesTab();
    expect(screen.queryByRole('button', { name: 'Delete Hero' })).toBeNull();
  });
});

describe('saving', () => {
  function renderSaveButton(library: TTemplateLibrary) {
    render(
      <TooltipProvider>
        <EmailBuilderProvider registry={REGISTRY} initialDocument={DOCUMENT} templateLibrary={library}>
          <SaveTemplateButton blockId="container" />
        </EmailBuilderProvider>
      </TooltipProvider>
    );
  }

  const openDialog = () => fireEvent.click(screen.getByRole('button', { name: 'Save as template' }));

  it('renders nothing for a library that cannot save', () => {
    renderSaveButton({ templates: [TEMPLATE] });
    expect(screen.queryByRole('button', { name: 'Save as template' })).toBeNull();
  });

  it('hands the host the subtree, its name and the root block type', async () => {
    const drafts: TBlockTemplateDraft[] = [];
    renderSaveButton({ save: (draft) => void drafts.push(draft) });

    openDialog();
    fireEvent.change(screen.getByLabelText('Template name'), { target: { value: '  Hero  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(drafts).toHaveLength(1));
    expect(drafts[0].name).toBe('Hero');
    expect(drafts[0].blockType).toBe('Container');
    expect(drafts[0].rootBlockId).toBe('container');
    expect(Object.keys(drafts[0].blocks).sort()).toEqual(['container', 'heading', 'text']);
    // A save that went through closes the dialog.
    await waitFor(() => expect(screen.queryByLabelText('Template name')).toBeNull());
  });

  it('will not save an unnamed template', () => {
    const save = jest.fn<(draft: TBlockTemplateDraft) => void>();
    renderSaveButton({ save });

    openDialog();
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(save).not.toHaveBeenCalled();
    expect(screen.getByText('Give the template a name.')).toBeTruthy();
  });

  it('keeps the dialog open and shows why when the host rejects', async () => {
    renderSaveButton({
      save: () => {
        throw new Error('Quota exceeded');
      },
    });

    openDialog();
    fireEvent.change(screen.getByLabelText('Template name'), { target: { value: 'Hero' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Quota exceeded')).toBeTruthy();
    expect(screen.getByLabelText('Template name')).toBeTruthy();
  });
});
