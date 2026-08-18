/**
 * The contract a host implements to let users keep parts of a document as
 * reusable partials — a styled hero, a footer, a three-column feature strip.
 *
 * Like the image library, this is callbacks rather than storage: the editor
 * never persists anything. `save` hands the host a plain JSON fragment, and the
 * host hands the saved set back through `templates`, so the list on screen is
 * always the host's own state and nothing has to be invalidated.
 */
import { TEditorConfiguration } from '../types';

/**
 * A subtree, self-contained: `blocks` holds the root block and every descendant
 * it references, keyed by id, and nothing else. Plain JSON — a host can store
 * it as it is and read it back with `JSON.parse`.
 */
export type TBlockTemplateContent = {
  /** The key in `blocks` the fragment starts at. */
  rootBlockId: string;
  blocks: TEditorConfiguration;
};

/** What `save` is handed. The host adds identity and gives it back as a `TBlockTemplate`. */
export type TBlockTemplateDraft = TBlockTemplateContent & {
  /** What the user typed in the save dialog. Never empty. */
  name: string;
  /**
   * The root block's type (`'Container'`, `'Image'`, …), so a host can group or
   * filter without walking the fragment.
   */
  blockType: string;
};

/** One saved partial, as the host holds it. */
export type TBlockTemplate = TBlockTemplateContent & {
  /**
   * Stable identity, used for React keys and for `remove`. Falls back to
   * `name`, so a host without ids can leave it out.
   */
  id?: string;
  name: string;
  /** Shown under the name in the list. */
  description?: string | null;
  /** A preview image for the list; without one the list shows the block type. */
  thumbnailUrl?: string | null;
};

/**
 * Given to `EmailBuilderProvider` as `templateLibrary`. Every member is
 * optional and the editor adapts to what it is given:
 *
 * - `save` alone — blocks grow a "Save as template" action, and the host does
 *   what it likes with the fragment.
 * - `templates` alone — a read-only library, listed in the sidebar and offered
 *   in the add-block menu.
 * - `remove` — adds a delete affordance to each entry in the list.
 *
 * With none of them, nothing about the editor changes.
 *
 * Keep the object stable (module scope or `useMemo`); the templates array
 * itself may change freely, and the list follows it.
 */
export type TTemplateLibrary = {
  /**
   * The saved partials, newest first if that is the order you want them shown —
   * the editor renders them as given.
   */
  templates?: TBlockTemplate[];
  /**
   * Persists a new partial. Rejecting surfaces the error's message in the save
   * dialog and leaves it open, so throw something worth reading; resolving
   * closes it.
   *
   * The editor does not add the result to the list — put it into whatever state
   * feeds `templates` and it appears.
   */
  save?: (draft: TBlockTemplateDraft) => void | Promise<void>;
  /**
   * Deletes one. Same deal: the list follows `templates`, not the outcome here.
   * Left out, entries cannot be deleted from the editor.
   */
  remove?: (template: TBlockTemplate) => void | Promise<void>;
};
