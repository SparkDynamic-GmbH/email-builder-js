import React from 'react';
import { z } from 'zod';

import { describe, expect, it, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { BlockDefinitionDictionary } from '../registry';

import buildBlockRegistry from './buildBlockRegistry';

const TextSchema = z.object({ text: z.string() });
const SpacerSchema = z.object({ height: z.number() });

function buildDefinitions() {
  return {
    Text: {
      schema: TextSchema,
      Reader: ({ text }) => <div>reader:{text}</div>,
      Editor: ({ text }) => <div>editor:{text}</div>,
      SidebarPanel: ({ data, setData }) => (
        <button onClick={() => setData({ text: `${data.text}!` })}>panel:{data.text}</button>
      ),
      menu: { label: 'Text', icon: <span>T</span>, defaults: () => ({ text: 'New text' }) },
    },
    Spacer: {
      schema: SpacerSchema,
      Reader: ({ height }) => <div>spacer:{height}</div>,
      chrome: false,
    },
  } satisfies BlockDefinitionDictionary<{ Text: typeof TextSchema; Spacer: typeof SpacerSchema }>;
}

describe('builders/buildBlockRegistry', () => {
  it('renders Reader on the reader dictionary and Editor on the editor dictionary', () => {
    const { ReaderBlockComponent, EditorBlockComponent } = buildBlockRegistry(buildDefinitions());

    expect(render(<ReaderBlockComponent type="Text" data={{ text: 'hi' }} />).container.textContent).toBe('reader:hi');
    expect(render(<EditorBlockComponent type="Text" data={{ text: 'hi' }} />).container.textContent).toBe('editor:hi');
  });

  it('falls back to Reader on the canvas when a block declares no Editor', () => {
    const { EditorBlockComponent } = buildBlockRegistry(buildDefinitions());

    expect(render(<EditorBlockComponent type="Spacer" data={{ height: 16 }} />).container.textContent).toBe(
      'spacer:16'
    );
  });

  it('wraps canvas blocks in the editor chrome, except those with chrome: false', () => {
    const { EditorBlockComponent } = buildBlockRegistry(buildDefinitions(), {
      EditorBlockWrapper: ({ children }) => <div data-testid="chrome">{children}</div>,
    });

    render(<EditorBlockComponent type="Text" data={{ text: 'hi' }} />);
    expect(screen.getByTestId('chrome').textContent).toBe('editor:hi');

    render(<EditorBlockComponent type="Spacer" data={{ height: 16 }} />);
    expect(screen.queryAllByTestId('chrome')).toHaveLength(1);
  });

  it('builds a document schema covering every registered block', () => {
    const { blockSchema, documentSchema } = buildBlockRegistry(buildDefinitions());

    expect(blockSchema.safeParse({ type: 'Text', data: { text: 'hi' } }).success).toBe(true);
    expect(blockSchema.safeParse({ type: 'Unregistered', data: {} }).success).toBe(false);
    expect(documentSchema.safeParse({ root: { type: 'Spacer', data: { height: 16 } } }).success).toBe(true);
  });

  it('lists only insertable blocks in the menu, with their default data', () => {
    const { menu } = buildBlockRegistry(buildDefinitions());

    expect(menu.map((m) => m.label)).toEqual(['Text']);
    expect(menu[0].block()).toEqual({ type: 'Text', data: { text: 'New text' } });
  });

  it('dispatches the inspector to the panel of the selected block', () => {
    const { SidebarPanel } = buildBlockRegistry(buildDefinitions());
    const setBlock = jest.fn();

    render(<SidebarPanel block={{ type: 'Text', data: { text: 'hi' } }} setBlock={setBlock} />);
    screen.getByRole('button').click();

    expect(setBlock).toHaveBeenCalledWith({ type: 'Text', data: { text: 'hi!' } });
  });

  it('renders nothing for a block whose definition declares no panel', () => {
    const { SidebarPanel } = buildBlockRegistry(buildDefinitions());

    const { container } = render(
      <SidebarPanel block={{ type: 'Spacer', data: { height: 16 } }} setBlock={jest.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });
});
