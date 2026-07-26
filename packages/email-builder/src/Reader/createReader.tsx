import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';

import {
  BaseZodDictionary,
  BlockConfiguration,
  buildBlockComponent,
  buildBlockConfigurationSchema,
  DocumentBlocksDictionary,
} from '@usewaypoint/document-core';

import { ReaderBlock, ReaderContext } from './ReaderBlock';

/**
 * Builds a Reader over an arbitrary block set. Pass a registry's
 * `readerDictionary` to render documents that use custom blocks — the preview
 * and the HTML export then know about exactly the blocks the canvas does.
 *
 * @param blocks Block set to render, keyed by block type
 */
export default function createReader<T extends BaseZodDictionary>(blocks: DocumentBlocksDictionary<T>) {
  const BlockComponent = buildBlockComponent(blocks);
  const blockSchema = buildBlockConfigurationSchema(blocks);
  const documentSchema = z.record(z.string(), blockSchema);

  type TDocument = Record<string, BlockConfiguration<T>>;

  type TReaderProps = {
    document: TDocument;
    rootBlockId: string;
  };

  function Reader({ document, rootBlockId }: TReaderProps) {
    return (
      <ReaderContext.Provider value={{ document, BlockComponent }}>
        <ReaderBlock id={rootBlockId} />
      </ReaderContext.Provider>
    );
  }

  type TRenderOptions = {
    rootBlockId: string;
  };

  function renderToStaticMarkup(document: TDocument, { rootBlockId }: TRenderOptions) {
    return (
      '<!DOCTYPE html>' +
      baseRenderToStaticMarkup(
        <html>
          <body>
            <Reader document={document} rootBlockId={rootBlockId} />
          </body>
        </html>
      )
    );
  }

  return { Reader, renderToStaticMarkup, blockSchema, documentSchema };
}
