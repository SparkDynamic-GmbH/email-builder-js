import { z } from 'zod';

import { buildBlockRegistry, createReader } from '@usewaypoint/email-builder';

import BLOCK_DEFINITIONS from '../blocks/definitions';
import EditorBlockWrapper from '../blocks/helpers/block-wrappers/EditorBlockWrapper';

export const EDITOR_REGISTRY = buildBlockRegistry(BLOCK_DEFINITIONS, { EditorBlockWrapper });

export const EditorBlock = EDITOR_REGISTRY.EditorBlockComponent;
export const EditorBlockSchema = EDITOR_REGISTRY.blockSchema;
export const EditorConfigurationSchema = EDITOR_REGISTRY.documentSchema;

export type TEditorBlock = z.infer<typeof EditorBlockSchema>;
export type TEditorConfiguration = Record<string, TEditorBlock>;

/**
 * Preview and HTML export, over the same block set as the canvas — a block
 * registered above renders in all three.
 */
export const { Reader, renderToStaticMarkup } = createReader(EDITOR_REGISTRY.readerDictionary);
