/**
 * The template library: saving part of a document as a reusable partial, and
 * putting one back in.
 *
 * The editor stores nothing. `save` hands the host a JSON fragment; the host
 * hands its saved set back as `templates`, and the sidebar and the add-block
 * menu render that array as it comes.
 */
export type { TBlockTemplate, TBlockTemplateContent, TBlockTemplateDraft, TTemplateLibrary } from './types';

export {
  extractBlockTemplate,
  instantiateBlockTemplate,
  isBlockTemplateContent,
  isTemplateLibraryUsable,
  templateBlockCount,
  templateBlockTypes,
  templateKey,
} from './helpers';

export { TemplateLibraryProvider, useTemplateLibrary } from './context';
export { default as useInsertBlockTemplate, useIsTemplateSupported } from './useInsertBlockTemplate';

export { default as SaveTemplateButton } from './SaveTemplateButton';
export { default as TemplateLibraryPanel } from './TemplateLibraryPanel';
export { default as TemplatesMenu, TTemplateInsertion } from './TemplatesMenu';
