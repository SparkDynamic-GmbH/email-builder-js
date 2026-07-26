import React from 'react';
import { z } from 'zod';

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, render } from '@testing-library/react';

import buildBlockRegistry from '../core/builders/buildBlockRegistry';
import { BlockDefinitionDictionary } from '../core/registry';

import { EmailBuilderProvider, useEditorActions } from './EditorContext';
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

/** Exposes the actions so a test can drive document changes from outside. */
let actions: ReturnType<typeof useEditorActions>;
function CaptureActions() {
  actions = useEditorActions();
  return null;
}

type Props = {
  onChange: (document: TEditorConfiguration) => void;
  onChangeDebounceMs?: number;
};

function renderProvider({ onChange, onChangeDebounceMs }: Props) {
  return render(
    <EmailBuilderProvider
      registry={registry}
      initialDocument={INITIAL}
      onChange={onChange}
      onChangeDebounceMs={onChangeDebounceMs}
    >
      <CaptureActions />
    </EmailBuilderProvider>
  );
}

describe('EmailBuilderProvider onChange', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('reports every change synchronously when no debounce is given', () => {
    const onChange = jest.fn();
    renderProvider({ onChange });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      actions.resetDocument(makeDocument('c'));
    });

    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(makeDocument('c'));
  });

  it('coalesces a run of changes into one call with the latest document', () => {
    const onChange = jest.fn();
    renderProvider({ onChange, onChangeDebounceMs: 500 });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      jest.advanceTimersByTime(400);
      actions.resetDocument(makeDocument('c'));
      jest.advanceTimersByTime(400);
    });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(makeDocument('c'));
  });

  it('flushes a pending change on unmount', () => {
    const onChange = jest.fn();
    const { unmount } = renderProvider({ onChange, onChangeDebounceMs: 500 });

    act(() => {
      actions.resetDocument(makeDocument('b'));
    });
    expect(onChange).not.toHaveBeenCalled();

    unmount();
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(makeDocument('b'));
  });

  it('does not call a stale onChange, and a new closure does not restart the timer', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderProvider({ onChange: first, onChangeDebounceMs: 500 });

    act(() => {
      actions.resetDocument(makeDocument('b'));
      jest.advanceTimersByTime(400);
    });

    rerender(
      <EmailBuilderProvider registry={registry} initialDocument={INITIAL} onChange={second} onChangeDebounceMs={500}>
        <CaptureActions />
      </EmailBuilderProvider>
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledWith(makeDocument('b'));
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
