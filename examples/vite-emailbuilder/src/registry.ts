import { z } from 'zod';

import { buildBlockRegistry, createReader } from '@sparkdynamic/email-builder';
import { BUILT_IN_BLOCK_DEFINITIONS, EditorBlockWrapper } from '@sparkdynamic/email-builder/editor';

/**
 * This app registers the built-in blocks and nothing else. A host with blocks of
 * its own spreads them in here, and the canvas, inspector, add-block menu,
 * preview and HTML export all follow from this one dictionary.
 */
export const EDITOR_REGISTRY = buildBlockRegistry(BUILT_IN_BLOCK_DEFINITIONS, { EditorBlockWrapper });

export const EditorBlockSchema = EDITOR_REGISTRY.blockSchema;
export const EditorConfigurationSchema = EDITOR_REGISTRY.documentSchema;

/**
 * The strict union over *this* app's block set, for the sample documents and for
 * validating imported JSON. The editor components themselves work over the
 * looser `TEditorBlock`, because they run against whatever set they are given.
 */
export type TStrictEditorBlock = z.infer<typeof EditorBlockSchema>;
export type TEditorConfiguration = Record<string, TStrictEditorBlock>;

/**
 * Preview and HTML export, over the same block set as the canvas — a block
 * registered above renders in all three.
 */
export const { Reader, renderToStaticMarkup } = createReader(EDITOR_REGISTRY.readerDictionary);
