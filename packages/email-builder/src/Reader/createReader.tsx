import React from 'react';
import { renderToStaticMarkup as baseRenderToStaticMarkup } from 'react-dom/server';
import { z } from 'zod';

import {
  BaseZodDictionary,
  BlockConfiguration,
  buildBlockComponent,
  buildBlockConfigurationSchema,
  DocumentBlocksDictionary,
} from '../core';

import { ReaderBlock, ReaderContext } from './ReaderBlock';

/**
 * A table's cells cannot wrap, so a column that stacks is one that has stopped
 * being a cell. `!important` is what beats the width `fixedWidths` writes inline
 * on the cell; the horizontal gap padding goes with it, since stacked it would
 * only indent one column against the other.
 *
 * The `<style>` block is a real dependency — a client that strips it falls back
 * to the desktop layout rather than breaking, but it does fall back. Anything
 * that has to survive stripping belongs inline on the block instead, the way the
 * image block's `max-width` already does.
 */
const RESPONSIVE_STYLESHEET =
  '@media only screen and (max-width:600px){' +
  '.eb-column{display:block!important;width:100%!important;padding-left:0!important;padding-right:0!important}' +
  '}';

/**
 * Built as a string rather than JSX: a conditional comment is not a node React
 * can emit, and the contents of a `<style>` would come back escaped.
 *
 * `PixelsPerInch` is what stops Outlook scaling the whole email by 4/3 on a
 * Windows display above 96 DPI. Without the viewport meta, a phone lays the
 * message out at desktop width and scales it down, so the media query above
 * would never get the chance to match.
 */
const HEAD =
  '<head>' +
  '<meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch>' +
  '</o:OfficeDocumentSettings></xml><![endif]-->' +
  `<style>${RESPONSIVE_STYLESHEET}</style>` +
  '</head>';

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
    // The `o:` namespace is what lets Word parse the conditional block in the head.
    return (
      '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office">' +
      HEAD +
      // Without this the client's default body margin shows as a gutter the backdrop colour never
      // reaches, and it eats into the width the media query above is measuring against.
      '<body style="margin:0;padding:0">' +
      baseRenderToStaticMarkup(<Reader document={document} rootBlockId={rootBlockId} />) +
      '</body></html>'
    );
  }

  return { Reader, renderToStaticMarkup, blockSchema, documentSchema };
}
