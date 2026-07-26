/**
 * The contract a host implements to plug its own asset store into the editor.
 *
 * These are callbacks rather than URLs on purpose: the host owns its base URL,
 * its auth headers, its retries and its error shapes, and none of that belongs
 * in this package.
 */

/** One image in the host's library. `url` is the only thing the document keeps. */
export type TImageLibraryItem = {
  /**
   * Stable identity, used for React keys and for selection. Falls back to
   * `url`, so a host without ids can leave it out.
   */
  id?: string;
  /** Where the image is served from — what gets written into the block. */
  url: string;
  /**
   * Alt text the library already knows. Applied only when the block has none,
   * so it never overwrites what the user typed.
   */
  alt?: string | null;
  /** Shown under the thumbnail in the built-in picker. */
  name?: string | null;
  /** A smaller rendition for the grid. Falls back to `url`. */
  thumbnailUrl?: string | null;
};

export type TImageLibraryListParams = {
  /** What the user typed in the picker's search box; `''` when empty. */
  query: string;
  /** `null` for the first page; afterwards, the previous result's `nextCursor`. */
  cursor: string | null;
  /** Aborted when the dialog closes or the query changes — pass it to `fetch`. */
  signal: AbortSignal;
};

export type TImageLibraryListResult = {
  items: TImageLibraryItem[];
  /** Leave out or `null` when there is no further page. */
  nextCursor?: string | null;
};

export type TImageLibraryUploadParams = {
  /** Aborted when the dialog closes — pass it to `fetch`. */
  signal: AbortSignal;
};

/**
 * Given to `EmailBuilderProvider` as `imageLibrary`. Every member is optional
 * and the editor adapts to what it is given:
 *
 * - `pick` alone — the editor shows a button and hands off entirely; the host
 *   renders its own asset manager and resolves with the chosen image.
 * - `upload` and/or `list` — the editor's own picker dialog, with a dropzone,
 *   a browsable grid, or both.
 * - `pick` together with the others — `pick` wins; the built-in dialog is not
 *   rendered.
 *
 * With none of the three, the Image panel is exactly what it was: a URL field.
 *
 * Keep the object stable (module scope or `useMemo`).
 */
export type TImageLibrary = {
  /**
   * Stores a file and resolves with where it now lives. Return a bare URL
   * string if that is all you have.
   *
   * Rejecting surfaces the error's message in the dialog and leaves it open, so
   * throw something worth reading.
   */
  upload?: (file: File, params: TImageLibraryUploadParams) => Promise<TImageLibraryItem | string>;
  /**
   * One page of the library, filtered by `query`. Called again with the
   * returned `nextCursor` when the user asks for more.
   *
   * An `AbortError` rejection is treated as a cancellation and shown as
   * nothing; anything else is shown as an error with a retry.
   */
  list?: (params: TImageLibraryListParams) => Promise<TImageLibraryListResult>;
  /**
   * Takes over the whole interaction: the editor renders a button, calls this,
   * and writes whatever comes back. Resolve with `null` if the user cancelled.
   *
   * `current` is the block's URL at the time, so the host can preselect.
   */
  pick?: (current: { url: string | null }) => Promise<TImageLibraryItem | string | null>;
  /**
   * The file input's `accept`, also enforced before `upload` is called.
   * Defaults to `'image/*'`.
   */
  accept?: string;
  /**
   * Rejected in the dialog before `upload` is called. Server-side limits still
   * need enforcing server-side — this only saves the round trip.
   */
  maxFileSizeBytes?: number;
};
