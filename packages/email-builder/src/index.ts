// The block-dictionary framework: declare a block once, derive every consumer.
export * from './core';

export { default as createReader } from './Reader/createReader';

export { ReaderBlock, TReaderBlockProps } from './Reader/ReaderBlock';

// Container blocks live here rather than alongside the leaf blocks because they
// recurse through ReaderBlock. A custom block set still needs them.
export { default as ColumnsContainerReader } from './blocks/ColumnsContainer/ColumnsContainerReader';
export { default as ContainerReader } from './blocks/Container/ContainerReader';
export { default as EmailLayoutReader } from './blocks/EmailLayout/EmailLayoutReader';

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
