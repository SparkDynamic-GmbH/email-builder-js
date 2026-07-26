import type { TImageLibrary, TImageLibraryItem } from '@sparkdynamic/email-builder/editor';

/**
 * Stands in for a host's asset store, the same way `persistence.ts` stands in
 * for its backend. `Cloudwawi.Web` will call its media API here; the shape the
 * editor cares about is only the two promises.
 *
 * Uploads are kept as data URLs in `localStorage` so a reload still finds them.
 * A real host must not do that — a data URL in the document bloats every send,
 * and several ESPs strip them. Upload, then store the returned URL.
 */
const KEY = 'email-builder:images';

/** Enough latency to see the dialog's loading and uploading states. */
const FAKE_LATENCY_MS = 400;

/** Small enough to page a seeded library of eight. */
const PAGE_SIZE = 6;

const SEED: TImageLibraryItem[] = [
  { id: 'seed-1', url: 'https://placehold.co/600x400/EEE/31343C?text=Header', name: 'Header', alt: 'Header banner' },
  { id: 'seed-2', url: 'https://placehold.co/600x400/DDEEFF/31343C?text=Product', name: 'Product', alt: 'A product' },
  { id: 'seed-3', url: 'https://placehold.co/600x400/FFE9D6/31343C?text=Offer', name: 'Offer', alt: 'An offer' },
  { id: 'seed-4', url: 'https://placehold.co/600x400/E6F4EA/31343C?text=Team', name: 'Team', alt: 'The team' },
  { id: 'seed-5', url: 'https://placehold.co/600x400/F3E8FF/31343C?text=Event', name: 'Event', alt: 'An event' },
  { id: 'seed-6', url: 'https://placehold.co/600x400/FDE8E8/31343C?text=Sale', name: 'Sale', alt: 'A sale' },
  { id: 'seed-7', url: 'https://placehold.co/600x400/E8F0FE/31343C?text=Footer', name: 'Footer', alt: 'Footer image' },
  { id: 'seed-8', url: 'https://placehold.co/600x400/F5F5F5/31343C?text=Logo', name: 'Logo', alt: 'The logo' },
];

function loadUploaded(): TImageLibraryItem[] {
  try {
    const stored = localStorage.getItem(KEY);
    return stored === null ? [] : (JSON.parse(stored) as TImageLibraryItem[]);
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

function storeUploaded(items: TImageLibraryItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // A quota error here is the data-URL caveat above biting; the upload still
    // works for this session.
  }
}

/** Rejects on abort the way `fetch` does, so the editor treats it as a cancel. */
function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timeout);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`${file.name} could not be read.`));
    reader.readAsDataURL(file);
  });
}

export const imageLibrary: TImageLibrary = {
  accept: 'image/png,image/jpeg,image/gif,image/webp,image/svg+xml',
  maxFileSizeBytes: 2 * 1024 * 1024,

  async list({ query, cursor, signal }) {
    await delay(FAKE_LATENCY_MS, signal);

    const all = [...loadUploaded(), ...SEED];
    const needle = query.trim().toLowerCase();
    const matching =
      needle.length === 0
        ? all
        : all.filter((item) => `${item.name ?? ''} ${item.alt ?? ''}`.toLowerCase().includes(needle));

    const offset = cursor === null ? 0 : Number(cursor);
    const page = matching.slice(offset, offset + PAGE_SIZE);
    const next = offset + PAGE_SIZE;

    return { items: page, nextCursor: next < matching.length ? String(next) : null };
  },

  async upload(file, { signal }) {
    await delay(FAKE_LATENCY_MS, signal);

    const item: TImageLibraryItem = {
      id: `upload-${file.name}-${file.size}`,
      url: await readAsDataUrl(file),
      name: file.name,
      alt: file.name.replace(/\.[^.]+$/, ''),
    };

    const uploaded = loadUploaded().filter((existing) => existing.id !== item.id);
    storeUploaded([item, ...uploaded]);
    return item;
  },
};
