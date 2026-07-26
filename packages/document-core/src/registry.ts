import type { JSX } from 'react';
import { z } from 'zod';

import { BaseZodDictionary } from './utils';

export type SidebarPanelProps<TData> = {
  data: TData;
  setData: (data: TData) => void;
};

export type BlockMenuEntry<TData> = {
  /** Label shown in the add-block menu. */
  label: string;
  /** Icon shown in the add-block menu. */
  icon: JSX.Element;
  /** Data for a freshly inserted block. */
  defaults: () => TData;
};

/**
 * Everything the reader, the canvas, the inspector and the add-block menu need
 * to know about a single block type, declared once.
 */
export type BlockDefinition<TSchema extends z.AnyZodObject> = {
  schema: TSchema;
  /** Renders the block as email HTML. */
  Reader: (props: z.infer<TSchema>) => JSX.Element;
  /** Renders the block on the editor canvas. Defaults to `Reader`. */
  Editor?: (props: z.infer<TSchema>) => JSX.Element;
  /** Inspector panel. Omit for a block with nothing to configure. */
  SidebarPanel?: (props: SidebarPanelProps<z.infer<TSchema>>) => JSX.Element;
  /** Omit for a block the user cannot insert directly. */
  menu?: BlockMenuEntry<z.infer<TSchema>>;
  /**
   * Whether the canvas component is wrapped in the editor chrome (selection
   * outline, block menu). Defaults to `true`; set `false` for a block that
   * owns the whole canvas, such as the email layout.
   */
  chrome?: boolean;
};

export type BlockDefinitionDictionary<T extends BaseZodDictionary> = {
  [K in keyof T]: BlockDefinition<T[K]>;
};
