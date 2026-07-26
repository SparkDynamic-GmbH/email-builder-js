import React from 'react';

import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ImagePickerButton, TImageLibrary, TImageLibraryItem } from '.';
import { formatBytes, imageLibraryItemKey, isImageLibraryUsable, matchesAccept, toImageLibraryItem } from './helpers';

const ITEMS: TImageLibraryItem[] = [
  { id: 'a', url: 'https://example.test/a.png', name: 'Alpha' },
  { id: 'b', url: 'https://example.test/b.png', name: 'Beta', alt: 'A beta' },
];

function renderButton(library: TImageLibrary, currentUrl: string | null = null) {
  const onSelect = jest.fn<(item: TImageLibraryItem) => void>();
  render(<ImagePickerButton library={library} currentUrl={currentUrl} onSelect={onSelect} />);
  return onSelect;
}

const openDialog = () => fireEvent.click(screen.getByRole('button', { name: /choose image/i }));

const button = (name: string) => screen.getByRole('button', { name }) as HTMLButtonElement;

/** The dropzone's input is hidden by class, not by an attribute, so it is here. */
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;

const alertText = async () => (await screen.findByRole('alert')).textContent;

describe('helpers', () => {
  it('treats a library with no member as unusable', () => {
    expect(isImageLibraryUsable({})).toBe(false);
    expect(isImageLibraryUsable({ accept: 'image/png' })).toBe(false);
    expect(isImageLibraryUsable({ list: async () => ({ items: [] }) })).toBe(true);
  });

  it('normalizes a bare url into an item', () => {
    expect(toImageLibraryItem('https://example.test/a.png')).toEqual({ url: 'https://example.test/a.png' });
    expect(toImageLibraryItem(ITEMS[0])).toBe(ITEMS[0]);
  });

  it('keys on the id when there is one, and the url otherwise', () => {
    expect(imageLibraryItemKey(ITEMS[0])).toBe('a');
    expect(imageLibraryItemKey({ url: 'u' })).toBe('u');
  });

  it('matches accept by extension, exact type and wildcard', () => {
    const png = new File([''], 'photo.png', { type: 'image/png' });
    const pdf = new File([''], 'notes.pdf', { type: 'application/pdf' });

    expect(matchesAccept(png, 'image/*')).toBe(true);
    expect(matchesAccept(png, 'image/png,image/jpeg')).toBe(true);
    expect(matchesAccept(png, '.png')).toBe(true);
    expect(matchesAccept(pdf, 'image/*')).toBe(false);
    expect(matchesAccept(pdf, '.png,.jpg')).toBe(false);
    // An empty accept constrains nothing.
    expect(matchesAccept(pdf, '')).toBe(true);
  });

  it('formats a byte limit the way the message reads it', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2 kB');
    expect(formatBytes(2 * 1024 * 1024)).toBe('2 MB');
  });
});

describe('a host-owned picker', () => {
  it('hands off to pick, and applies what comes back', async () => {
    const pick = jest.fn<NonNullable<TImageLibrary['pick']>>(async () => 'https://example.test/picked.png');
    const onSelect = renderButton({ pick }, 'https://example.test/current.png');

    openDialog();

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith({ url: 'https://example.test/picked.png' }));
    // The host gets the block's current url, so it can preselect.
    expect(pick).toHaveBeenCalledWith({ url: 'https://example.test/current.png' });
    // It renders no dialog of its own.
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('applies nothing when the host resolves with null', async () => {
    const onSelect = renderButton({ pick: async () => null });

    openDialog();

    await waitFor(() => expect(button('Choose image…').disabled).toBe(false));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('surfaces a rejection', async () => {
    const onSelect = renderButton({ pick: () => Promise.reject(new Error('The picker is down.')) });

    openDialog();

    expect(await alertText()).toBe('The picker is down.');
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('the built-in dialog', () => {
  it('lists, selects, and applies', async () => {
    const list = jest.fn<NonNullable<TImageLibrary['list']>>(async () => ({ items: ITEMS, nextCursor: null }));
    const onSelect = renderButton({ list });

    openDialog();

    const option = await screen.findByRole('option', { name: /Alpha/ });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ query: '', cursor: null }));

    // Nothing is selected yet, so there is nothing to apply.
    expect(button('Select').disabled).toBe(true);

    fireEvent.click(option);
    expect(option.getAttribute('aria-selected')).toBe('true');
    expect(button('Select').disabled).toBe(false);

    fireEvent.click(button('Select'));
    expect(onSelect).toHaveBeenCalledWith(ITEMS[0]);
  });

  it('pages with the cursor the host returned', async () => {
    const list = jest.fn<NonNullable<TImageLibrary['list']>>(async ({ cursor }) =>
      cursor === null ? { items: [ITEMS[0]], nextCursor: 'page-2' } : { items: [ITEMS[1]], nextCursor: null }
    );
    renderButton({ list });

    openDialog();

    fireEvent.click(await screen.findByRole('button', { name: 'Load more' }));

    await screen.findByRole('option', { name: /Beta/ });
    // Both pages are on screen; the second did not replace the first.
    expect(screen.getAllByRole('option')).toHaveLength(2);
    expect(list).toHaveBeenLastCalledWith(expect.objectContaining({ cursor: 'page-2' }));
    expect(screen.queryByRole('button', { name: 'Load more' })).toBeNull();
  });

  it('offers a retry when listing fails', async () => {
    let attempt = 0;
    const list = jest.fn<NonNullable<TImageLibrary['list']>>(async () => {
      attempt += 1;
      if (attempt === 1) {
        throw new Error('The library is unreachable.');
      }
      return { items: ITEMS, nextCursor: null };
    });
    renderButton({ list });

    openDialog();

    expect(await alertText()).toBe('The library is unreachable.');

    fireEvent.click(button('Try again'));

    await screen.findByRole('option', { name: /Alpha/ });
  });

  it('uploads and applies in one step', async () => {
    const uploaded: TImageLibraryItem = { id: 'new', url: 'https://example.test/new.png' };
    const upload = jest.fn<NonNullable<TImageLibrary['upload']>>(async () => uploaded);
    const onSelect = renderButton({ upload });

    openDialog();

    fireEvent.change(fileInput(), { target: { files: [new File(['x'], 'photo.png', { type: 'image/png' })] } });

    await waitFor(() => expect(onSelect).toHaveBeenCalledWith(uploaded));
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it('rejects a file over the size limit before calling upload', async () => {
    const upload = jest.fn<NonNullable<TImageLibrary['upload']>>(async () => 'unused');
    renderButton({ upload, maxFileSizeBytes: 1024 });

    openDialog();

    const file = new File([''], 'huge.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 4096 });
    fireEvent.change(fileInput(), { target: { files: [file] } });

    expect(await alertText()).toBe('huge.png is larger than the limit of 1 kB.');
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects a file the accept list excludes', async () => {
    const upload = jest.fn<NonNullable<TImageLibrary['upload']>>(async () => 'unused');
    renderButton({ upload, accept: 'image/png' });

    openDialog();

    fireEvent.change(fileInput(), { target: { files: [new File([''], 'notes.pdf', { type: 'application/pdf' })] } });

    expect(await alertText()).toBe('notes.pdf is not an accepted image type.');
    expect(upload).not.toHaveBeenCalled();
  });
});
