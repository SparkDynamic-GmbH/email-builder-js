/**
 * Document-wide styling: the layout's own colours and typeface, plus the
 * defaults a freshly inserted block starts from.
 *
 * Both live on the root `EmailLayout` block — its existing fields for the
 * former, its `blockDefaults` map for the latter — so styling travels with the
 * document as plain JSON and needs no storage of its own.
 *
 * A **preset** is that pair, named: applying one writes the layout fields and
 * replaces the defaults map in a single step.
 */
import { EmailLayoutProps } from '../../blocks/EmailLayout/EmailLayoutPropsSchema';

/**
 * The layout fields a preset carries. `preheader` and `childrenIds` are the
 * document's content, not its styling, and are never written by a preset.
 */
export type TStylePresetLayout = Pick<
  EmailLayoutProps,
  'backdropColor' | 'borderColor' | 'borderRadius' | 'canvasColor' | 'textColor' | 'fontFamily'
>;

/**
 * What a new block of a given type starts from, keyed by block type.
 *
 * An entry is merged over the definition's own defaults section by section
 * (`props` over `props`, `style` over `style`), so a preset may carry style
 * alone and leave the placeholder content the definition declares intact. The
 * merged result is checked against the registry's schema before it is used, and
 * an entry that does not fit — a stale type, a block the host never registered —
 * is ignored rather than inserted.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TBlockDefaults = Record<string, any>;

/** One named styling, as the host holds it. */
export type TStylePreset = {
  /**
   * Stable identity, used for React keys and for `remove`. Falls back to
   * `name`, so a host without ids can leave it out.
   */
  id?: string;
  name: string;
  /** Shown under the name in the list. */
  description?: string | null;
  /** A preview image for the list; without one the list shows a colour swatch. */
  thumbnailUrl?: string | null;
  /**
   * Hides the delete affordance for this entry even when the library has a
   * `remove`. A host that offers its own saved presets alongside a set it ships
   * marks the shipped ones with this, since they are not the user's to delete.
   */
  readOnly?: boolean;
  /** The layout's colours, border and typeface. Fields left out are not touched. */
  layout?: TStylePresetLayout | null;
  /**
   * What each block type starts from. Merged into the document's map rather
   * than replacing it, type by type and then section by section, so a preset
   * says only what it is about and leaves the rest of the document's defaults
   * standing. A preset therefore cannot clear a default, only overwrite one.
   */
  blockDefaults?: TBlockDefaults | null;
};

/** What `save` is handed. The host adds identity and gives it back as a `TStylePreset`. */
export type TStylePresetDraft = {
  /** What the user typed in the save dialog. Never empty. */
  name: string;
  layout: TStylePresetLayout;
  blockDefaults: TBlockDefaults;
};

/**
 * Given to `EmailBuilderProvider` as `stylePresets`. Every member is optional
 * and the editor adapts to what it is given:
 *
 * - `presets` alone — a read-only set, offered at the top of the Styles tab.
 * - `save` — the tab grows a "Save current styling" action, and the host does
 *   what it likes with the draft.
 * - `remove` — adds a delete affordance to each entry.
 *
 * Leave the whole prop out and the editor offers {@link BUILT_IN_STYLE_PRESETS}
 * instead; pass `{ presets: [] }` to offer none at all.
 *
 * Keep the object stable (module scope or `useMemo`); the `presets` array
 * inside it may change freely.
 */
export type TStylePresetLibrary = {
  presets?: TStylePreset[];
  /**
   * Persists the document's current styling under a name. Rejecting surfaces
   * the error's message in the dialog and leaves it open; resolving closes it.
   *
   * The editor does not add the result to the list — put it into whatever state
   * feeds `presets` and it appears.
   */
  save?: (draft: TStylePresetDraft) => void | Promise<void>;
  /** Deletes one. Left out, entries cannot be deleted from the editor. */
  remove?: (preset: TStylePreset) => void | Promise<void>;
};
