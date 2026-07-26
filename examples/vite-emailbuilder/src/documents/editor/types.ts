import { BlockRegistry } from '@sparkdynamic/email-builder';

/**
 * A block as the editor sees it. The editor works over whatever block set it is
 * given, so it cannot know the discriminated union its host derives from its own
 * definitions — build that from `registry.blockSchema` where you need it, as
 * `documents/editor/core.tsx` does for the sample documents.
 */
export type TEditorBlock = {
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
};

export type TEditorConfiguration = Record<string, TEditorBlock>;

/**
 * A registry with its block set erased. The provider takes a concrete
 * `BlockRegistry<T>` and erases it once, here, so that every component below can
 * be written against one type rather than being generic in the block set.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TEditorRegistry = BlockRegistry<any>;
