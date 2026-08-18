import React from 'react';

import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import buildBlockRegistry from '../../core/builders/buildBlockRegistry';
import BUILT_IN_BLOCK_DEFINITIONS from '../definitions';
import { EmailBuilderProvider } from '../EditorContext';
import EditorBlockWrapper from '../helpers/block-wrappers/EditorBlockWrapper';
import InspectorDrawer from '../inspector/InspectorDrawer';
import { TEditorBlock, TEditorConfiguration, TEditorRegistry } from '../types';
import { TooltipProvider } from '../ui/Tooltip';

import {
  applyStylePreset,
  extractStylePreset,
  getBlockDefaults,
  getStylePresetLayout,
  isStylePresetLibraryUsable,
  resolveNewBlock,
  setBlockDefault,
  stylePresetKey,
} from './helpers';
import { BUILT_IN_STYLE_PRESETS } from './presets';
import { TStylePreset, TStylePresetDraft, TStylePresetLibrary } from './types';

const REGISTRY = buildBlockRegistry(BUILT_IN_BLOCK_DEFINITIONS, { EditorBlockWrapper });

/**
 * The helpers are written against the erased registry and the loose document,
 * the way every component below the provider is; the provider itself wants the
 * strict union. Both views of the same two values, so the tests can use either.
 */
const R = REGISTRY as unknown as TEditorRegistry;

// Radix's Tabs measures its indicator, and jsdom has no ResizeObserver.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const PADDING = { top: 4, bottom: 4, left: 8, right: 8 };

const DOCUMENT = {
  root: { type: 'EmailLayout' as const, data: { childrenIds: ['text'], preheader: 'Keep me' } },
  text: { type: 'Text' as const, data: { props: { text: 'Body' }, style: { padding: PADDING, fontSize: 12 } } },
};

const DOC: TEditorConfiguration = DOCUMENT;

/** What a definition's own defaults produce, as the add-block menu would. */
function menuBlock(type: string): TEditorBlock {
  return REGISTRY.menu.find((entry) => entry.type === type)!.block() as TEditorBlock;
}

describe('helpers', () => {
  it('treats a library with neither presets nor a save as unusable', () => {
    expect(isStylePresetLibraryUsable(undefined)).toBe(false);
    expect(isStylePresetLibraryUsable({})).toBe(false);
    expect(isStylePresetLibraryUsable({ presets: [] })).toBe(false);
    expect(isStylePresetLibraryUsable({ remove: () => {} })).toBe(false);
    expect(isStylePresetLibraryUsable({ save: () => {} })).toBe(true);
    expect(isStylePresetLibraryUsable({ presets: BUILT_IN_STYLE_PRESETS })).toBe(true);
  });

  it('keys on the id when there is one, and the name otherwise', () => {
    expect(stylePresetKey({ id: 'a', name: 'Brand' })).toBe('a');
    expect(stylePresetKey({ name: 'Brand' })).toBe('Brand');
  });

  it('reads no defaults from a document that has none', () => {
    expect(getBlockDefaults(DOC)).toEqual({});
    expect(getBlockDefaults({})).toEqual({});
  });

  it('falls back to the definition when the document has no default for the type', () => {
    expect(resolveNewBlock(R, DOC, menuBlock('Text'))).toEqual(menuBlock('Text'));
  });

  it('lays a style-only default over the definition, keeping its placeholder content', () => {
    const document = { ...DOC, ...setBlockDefault(DOC, 'Text', { style: { padding: PADDING } }) };
    const block = resolveNewBlock(R, document, menuBlock('Text'));
    expect(block.data.style.padding).toEqual(PADDING);
    expect(block.data.props.text).toBe(menuBlock('Text').data.props.text);
    // The definition's other style keys survive the merge.
    expect(block.data.style.fontWeight).toBe('normal');
  });

  it('ignores a default the schema rejects rather than inserting an invalid block', () => {
    const document = { ...DOC, ...setBlockDefault(DOC, 'Text', { style: { fontSize: 'huge' } }) };
    expect(resolveNewBlock(R, document, menuBlock('Text'))).toEqual(menuBlock('Text'));
  });

  it('clears the default for a type when given undefined', () => {
    const withDefault = { ...DOC, ...setBlockDefault(DOC, 'Text', { style: { padding: PADDING } }) };
    const cleared = { ...withDefault, ...setBlockDefault(withDefault, 'Text', undefined) };
    expect(getBlockDefaults(cleared)).toEqual({});
  });

  it('round-trips the document styling through a preset', () => {
    const styled: TEditorConfiguration = {
      ...DOC,
      root: { ...DOC.root, data: { ...DOC.root.data, canvasColor: '#ABCDEF' } },
    };
    const withDefault = { ...styled, ...setBlockDefault(styled, 'Text', { style: { padding: PADDING } }) };
    const draft = extractStylePreset(withDefault, 'Brand');

    expect(draft.name).toBe('Brand');
    expect(draft.layout.canvasColor).toBe('#ABCDEF');
    expect(draft.blockDefaults.Text.style.padding).toEqual(PADDING);
    // Content is not styling and never travels in a preset.
    expect(draft.layout).not.toHaveProperty('preheader');
    expect(draft.layout).not.toHaveProperty('childrenIds');
  });

  it('reads only the styling keys off the layout', () => {
    expect(getStylePresetLayout(DOC)).toEqual({});
    expect(getStylePresetLayout({ root: { type: 'EmailLayout', data: { textColor: '#111111' } } })).toEqual({
      textColor: '#111111',
    });
  });
});

describe('applyStylePreset', () => {
  const preset: TStylePreset = {
    name: 'Roomy',
    layout: {
      canvasColor: '#FFEEDD',
      textColor: null,
      backdropColor: null,
      borderColor: null,
      borderRadius: null,
      fontFamily: null,
    },
    blockDefaults: { Text: { style: { padding: { top: 40, bottom: 40, left: 40, right: 40 }, fontSize: 20 } } },
  };

  it('merges into the defaults already there rather than replacing them', () => {
    const withHeading = { ...DOC, ...setBlockDefault(DOC, 'Heading', { style: { padding: PADDING } }) };
    const next = applyStylePreset(R, withHeading, preset);
    const defaults = getBlockDefaults(next);

    // The preset named Text, so Text is the preset's.
    expect(defaults.Text.style.fontSize).toBe(20);
    // It said nothing about Heading, so the document keeps what it had.
    expect(defaults.Heading.style.padding).toEqual(PADDING);
  });

  it('merges section by section within a type, so a style-only preset keeps a props default', () => {
    const withProps = { ...DOC, ...setBlockDefault(DOC, 'Text', { props: { text: 'House style' } }) };
    const defaults = getBlockDefaults(applyStylePreset(R, withProps, preset));

    expect(defaults.Text.props.text).toBe('House style');
    expect(defaults.Text.style.fontSize).toBe(20);
  });

  it('restyles only the types the preset itself named', () => {
    const document: TEditorConfiguration = {
      ...DOC,
      ...setBlockDefault(DOC, 'Heading', { style: { fontFamily: 'MONOSPACE' } }),
      heading: { type: 'Heading', data: { props: { text: 'Hi' }, style: { fontFamily: 'MODERN_SANS' } } },
    };
    const next = applyStylePreset(R, document, preset, { restyleExistingBlocks: true });

    expect(next.text.data.style.fontSize).toBe(20);
    // Heading has a default in the document, but not in this preset.
    expect(next.heading.data.style.fontFamily).toBe('MODERN_SANS');
  });

  it('writes the layout and the defaults, and keeps the content', () => {
    const next = applyStylePreset(R, DOC, preset);
    expect(next.root.data.canvasColor).toBe('#FFEEDD');
    expect(next.root.data.preheader).toBe('Keep me');
    expect(next.root.data.childrenIds).toEqual(['text']);
    expect(next.root.data.blockDefaults).toEqual(preset.blockDefaults);
    // Nothing was there to merge with, so the preset's map is the whole of it.
  });

  it('leaves the blocks already in the document alone by default', () => {
    expect(applyStylePreset(R, DOC, preset).text).toEqual(DOC.text);
  });

  it('restyles them when asked, without touching their content', () => {
    const next = applyStylePreset(R, DOC, preset, { restyleExistingBlocks: true });
    expect(next.text.data.style.fontSize).toBe(20);
    expect(next.text.data.style.padding).toEqual({ top: 40, bottom: 40, left: 40, right: 40 });
    expect(next.text.data.props.text).toBe('Body');
  });

  it('leaves a block the restyle would invalidate as it was', () => {
    const bad: TStylePreset = { name: 'Bad', blockDefaults: { Text: { style: { fontSize: 'huge' } } } };
    const next = applyStylePreset(R, DOC, bad, { restyleExistingBlocks: true });
    expect(next.text).toEqual(DOC.text);
  });

  it('ships presets that every built-in block type validates against', () => {
    for (const builtIn of BUILT_IN_STYLE_PRESETS) {
      const applied = applyStylePreset(R, DOC, builtIn);
      for (const entry of REGISTRY.menu) {
        const block = resolveNewBlock(R, applied, entry.block());
        expect(REGISTRY.blockSchema.safeParse(block).success).toBe(true);
      }
    }
  });
});

function renderInspector(library?: TStylePresetLibrary) {
  return render(
    <TooltipProvider>
      <EmailBuilderProvider registry={REGISTRY} initialDocument={DOCUMENT} stylePresets={library}>
        <InspectorDrawer />
      </EmailBuilderProvider>
    </TooltipProvider>
  );
}

describe('the Styles tab', () => {
  it('offers the built-in presets when the host configured none', () => {
    renderInspector();
    expect(screen.getByText('Default')).toBeTruthy();
    expect(screen.getByText('Editorial')).toBeTruthy();
  });

  it('offers none when the host passed an empty set', () => {
    renderInspector({ presets: [] });
    expect(screen.queryByText('Default')).toBeNull();
  });

  it('applies a preset only after the dialog is confirmed', async () => {
    const onChange = jest.fn();
    render(
      <TooltipProvider>
        <EmailBuilderProvider registry={REGISTRY} initialDocument={DOCUMENT} onChange={onChange}>
          <InspectorDrawer />
        </EmailBuilderProvider>
      </TooltipProvider>
    );

    fireEvent.click(screen.getByText('Editorial'));
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('Apply'));
    await waitFor(() => expect(onChange).toHaveBeenCalled());

    const document = onChange.mock.calls.at(-1)![0] as TEditorConfiguration;
    expect(document.root.data.fontFamily).toBe('MODERN_SERIF');
    // Restyle was left off, so the block already there is untouched.
    expect(document.text).toEqual(DOC.text);
  });

  it('hands the host a draft of the current styling', async () => {
    const save = jest.fn<(draft: TStylePresetDraft) => void>();
    renderInspector({ presets: [], save });

    fireEvent.click(screen.getByText('Save current styling'));
    fireEvent.change(screen.getByLabelText('Preset name'), { target: { value: 'Brand' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => expect(save).toHaveBeenCalled());
    expect(save.mock.calls[0][0].name).toBe('Brand');
  });
});
