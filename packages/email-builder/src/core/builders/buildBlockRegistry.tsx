import React, { JSX } from 'react';
import { z } from 'zod';

import { BlockDefinitionDictionary } from '../registry';
import { BaseZodDictionary, BlockConfiguration, DocumentBlocksDictionary } from '../utils';

import buildBlockComponent from './buildBlockComponent';
import buildBlockConfigurationSchema from './buildBlockConfigurationSchema';

export type BlockRegistryOptions = {
  /**
   * Editor chrome applied to every canvas block that does not opt out with
   * `chrome: false` — selection outline, block menu. Left out, the canvas
   * renders bare blocks.
   */
  EditorBlockWrapper?: (props: { children: JSX.Element }) => JSX.Element;
};

/**
 * Derives every consumer of a block type — the reader and canvas dictionaries,
 * the document schema, the inspector dispatch and the add-block menu — from one
 * dictionary of BlockDefinitions. Registering a block means adding it here and
 * nowhere else.
 *
 * @param definitions One BlockDefinition per block type, keyed by type name
 * @param options Editor chrome to wrap canvas blocks in
 */
export default function buildBlockRegistry<T extends BaseZodDictionary>(
  definitions: BlockDefinitionDictionary<T>,
  options: BlockRegistryOptions = {}
) {
  const Wrapper = options.EditorBlockWrapper;
  const types = Object.keys(definitions) as (keyof T & string)[];

  const readerDictionary = {} as DocumentBlocksDictionary<T>;
  const editorDictionary = {} as DocumentBlocksDictionary<T>;

  for (const type of types) {
    const definition = definitions[type];
    const Canvas = definition.Editor ?? definition.Reader;

    readerDictionary[type] = { schema: definition.schema, Component: definition.Reader };
    editorDictionary[type] = {
      schema: definition.schema,
      Component:
        Wrapper && definition.chrome !== false
          ? (props) => (
              <Wrapper>
                <Canvas {...props} />
              </Wrapper>
            )
          : Canvas,
    };
  }

  // The two dictionaries share their schemas, so a document validates the same
  // way whether it is being read or edited.
  const blockSchema = buildBlockConfigurationSchema(readerDictionary);
  const documentSchema = z.record(z.string(), blockSchema);

  const menu = types
    .filter((type) => definitions[type].menu !== undefined)
    .map((type) => {
      const { label, icon, defaults } = definitions[type].menu!;
      return {
        type,
        label,
        icon,
        block: () => ({ type, data: defaults() }) as BlockConfiguration<T>,
      };
    });

  type TBlock = BlockConfiguration<T>;
  type SidebarPanelProps = { block: TBlock; setBlock: (block: TBlock) => void };

  /**
   * Renders the inspector panel for a block, or nothing when its definition
   * declares no panel.
   */
  function SidebarPanel({ block, setBlock }: SidebarPanelProps) {
    const Panel = definitions[block.type]?.SidebarPanel;
    if (!Panel) {
      return null;
    }
    return <Panel data={block.data} setData={(data) => setBlock({ type: block.type, data } as TBlock)} />;
  }

  return {
    definitions,
    types,
    readerDictionary,
    editorDictionary,
    ReaderBlockComponent: buildBlockComponent(readerDictionary),
    EditorBlockComponent: buildBlockComponent(editorDictionary),
    blockSchema,
    documentSchema,
    menu,
    SidebarPanel,
  };
}
