// The block-dictionary framework: declare a block once, derive every consumer.
export * from './core';

// Leaf block renderers, each with its zod schema, props type and defaults.
export * from './blocks/Avatar';
export * from './blocks/Button';
export * from './blocks/Divider';
export * from './blocks/Heading';
export * from './blocks/Html';
export * from './blocks/Image';
export * from './blocks/Spacer';
export * from './blocks/Text';

// Container blocks. Their renderers take rendered children, and the `*Reader`
// variants resolve those children by id through ReaderBlock.
export * from './blocks/ColumnsContainer';
export * from './blocks/Container';
export { default as ColumnsContainerReader } from './blocks/ColumnsContainer/ColumnsContainerReader';
export { default as ContainerReader } from './blocks/Container/ContainerReader';
export { default as EmailLayoutReader } from './blocks/EmailLayout/EmailLayoutReader';
export { EmailLayoutProps, EmailLayoutPropsSchema } from './blocks/EmailLayout/EmailLayoutPropsSchema';

export { default as createReader } from './Reader/createReader';

export { ReaderBlock, TReaderBlockProps } from './Reader/ReaderBlock';

export {
  READER_DICTIONARY,
  ReaderBlockSchema,
  TReaderBlock,
  //
  ReaderDocumentSchema,
  TReaderDocument,
  //
  renderToStaticMarkup,
  //
  TReaderProps,
  default as Reader,
} from './Reader/core';
