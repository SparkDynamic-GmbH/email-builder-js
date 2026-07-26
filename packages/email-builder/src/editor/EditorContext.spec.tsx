import React from 'react';
import { z } from 'zod';

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render, screen } from '@testing-library/react';

import buildBlockRegistry from '../core/builders/buildBlockRegistry';
import { BlockDefinitionDictionary } from '../core/registry';

import { EmailBuilderProvider, useEditorActions, useIsDirty, useSaveStatus } from './EditorContext';
import SaveButton from './SaveButton';
import { TEditorConfiguration } from './types';

const TextSchema = z.object({ text: z.string() });

const registry = buildBlockRegistry({
  Text: {
    schema: TextSchema,
    Reader: ({ text }) => <div>{text}</div>,
  },
} satisfies BlockDefinitionDictionary<{ Text: typeof TextSchema }>);

function makeDocument(text: string) {
  return { root: { type: 'Text' as const, data: { text } } };
}

const INITIAL = makeDocument('a');

/** Exposes the store to a test: actions to drive it, save state to assert on. */
let actions: ReturnType<typeof useEditorActions>;
function Probe() {
  actions = useEditorActions();
  return (
    <div>
      <span data-testid="status">{useSaveStatus()}</span>
      <span data-testid="dirty">{String(useIsDirty())}</span>
    </div>
  );
}

type Props = {
  onChange?: (document: TEditorConfiguration) => void;
  onSave?: (document: TEditorConfiguration) => void | Promise<void>;
  autosave?: boolean;
  autosaveDebounceMs?: number;
};

function renderProvider(props: Props = {}) {
  return render(
    <EmailBuilderProvider registry={registry} initialDocument={INITIAL} {...props}>
      <Probe />
      <SaveButton />
    </EmailBuilderProvider>
  );
}

/** jest.fn() infers `unknown` for its return, which `onSave` will not accept. */
const saveSpy = () => jest.fn<(document: TEditorConfiguration) => void>();

/** Lets a save that resolves in a microtask settle inside act(). */
const settle = () => act(async () => {});

const status = () => screen.getByTestId('status').textContent;
const dirty = () => screen.getByTestId('dirty').textContent;

describe('EmailBuilderProvider onChange', () => {
  it('reports every document change, undebounced', () => {
    const onChange = jest.fn();
    renderProvider({ onChange });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      actions.resetDocument(makeDocument('c'));
    });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(makeDocument('c'));
  });

  it('ignores selection and panel state changes', () => {
    const onChange = jest.fn();
    renderProvider({ onChange });

    act(() => {
      actions.setSelectedBlockId('root');
      actions.setSelectedMainTab('preview');
      actions.toggleInspectorDrawerOpen();
    });

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('EmailBuilderProvider save', () => {
  it('starts clean and goes dirty on an edit', () => {
    renderProvider({ onSave: saveSpy() });
    expect(dirty()).toBe('false');
    expect(status()).toBe('idle');

    act(() => {
      actions.resetDocument(makeDocument('b'));
    });
    expect(dirty()).toBe('true');
  });

  it('save() hands the current document to onSave and clears dirty', async () => {
    const onSave = saveSpy();
    renderProvider({ onSave });

    act(() => {
      actions.resetDocument(makeDocument('b'));
    });
    await act(async () => {
      await actions.save();
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(makeDocument('b'));
    expect(status()).toBe('saved');
    expect(dirty()).toBe('false');
  });

  it('records a rejection and leaves the document dirty', async () => {
    const onSave = jest.fn<() => Promise<void>>().mockRejectedValue(new Error('backend down'));
    renderProvider({ onSave });

    act(() => {
      actions.resetDocument(makeDocument('b'));
    });
    await act(async () => {
      await actions.save();
    });

    expect(status()).toBe('error');
    expect(dirty()).toBe('true');
    expect(screen.getByRole('button', { name: /retry save/i })).toBeTruthy();
  });

  it('stays dirty when an edit lands while the save is in flight', async () => {
    let release: () => void = () => {};
    const onSave = jest.fn<() => Promise<void>>().mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      })
    );
    renderProvider({ onSave });

    act(() => {
      actions.resetDocument(makeDocument('b'));
    });
    let saved: Promise<void>;
    act(() => {
      saved = actions.save();
    });
    expect(status()).toBe('saving');

    act(() => {
      actions.resetDocument(makeDocument('c'));
    });
    await act(async () => {
      release();
      await saved;
    });

    // 'b' was saved; 'c' was not, so the editor is saved *and* dirty.
    expect(status()).toBe('saved');
    expect(dirty()).toBe('true');
  });

  it('joins an in-flight save rather than starting a second', async () => {
    let release: () => void = () => {};
    const onSave = jest.fn<() => Promise<void>>().mockReturnValue(
      new Promise<void>((resolve) => {
        release = resolve;
      })
    );
    renderProvider({ onSave });

    let first: Promise<void>;
    let second: Promise<void>;
    act(() => {
      first = actions.save();
      second = actions.save();
    });
    await act(async () => {
      release();
      await Promise.all([first, second]);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('does nothing, and renders no button, without an onSave', async () => {
    renderProvider();

    await act(async () => {
      await actions.save();
    });

    expect(status()).toBe('idle');
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('EmailBuilderProvider autosave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('is off by default — edits never reach onSave on their own', async () => {
    const onSave = saveSpy();
    renderProvider({ onSave });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      jest.advanceTimersByTime(60_000);
    });
    await settle();

    expect(onSave).not.toHaveBeenCalled();
  });

  it('defaults to a 10s debounce and coalesces a run of edits into one save', async () => {
    const onSave = saveSpy();
    renderProvider({ onSave, autosave: true });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      jest.advanceTimersByTime(9_000);
      actions.resetDocument(makeDocument('c'));
      jest.advanceTimersByTime(9_000);
    });
    expect(onSave).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1_000);
    });
    await settle();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(makeDocument('c'));
  });

  it('honours a custom debounce', async () => {
    const onSave = saveSpy();
    renderProvider({ onSave, autosave: true, autosaveDebounceMs: 500 });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      jest.advanceTimersByTime(500);
    });
    await settle();

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('flushes a pending autosave on unmount', async () => {
    const onSave = saveSpy();
    const { unmount } = renderProvider({ onSave, autosave: true });

    act(() => {
      actions.resetDocument(makeDocument('b'));
    });
    expect(onSave).not.toHaveBeenCalled();

    unmount();
    await settle();

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledWith(makeDocument('b'));
  });

  it('calls the current onSave, and a new closure does not restart the timer', async () => {
    const first = saveSpy();
    const second = saveSpy();
    const { rerender } = renderProvider({ onSave: first, autosave: true, autosaveDebounceMs: 500 });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      jest.advanceTimersByTime(400);
    });

    rerender(
      <EmailBuilderProvider
        registry={registry}
        initialDocument={INITIAL}
        onSave={second}
        autosave
        autosaveDebounceMs={500}
      >
        <Probe />
        <SaveButton />
      </EmailBuilderProvider>
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });
    await settle();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(makeDocument('b'));
  });
});
