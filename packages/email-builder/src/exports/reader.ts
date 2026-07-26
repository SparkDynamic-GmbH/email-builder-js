/**
 * Rendering a document to email HTML. `createReader` builds a reader over an
 * arbitrary block set; the default `Reader` covers the built-in blocks only.
 */
export { default as createReader } from '../Reader/createReader';

export { ReaderBlock, TReaderBlockProps } from '../Reader/ReaderBlock';

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
} from '../Reader/core';
