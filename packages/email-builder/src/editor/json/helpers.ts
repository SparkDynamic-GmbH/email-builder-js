import type { z } from 'zod';

import type { TEditorConfiguration } from '../types';

/** How the exported file is indented — readable, and diffable in a repo. */
const INDENT = '  ';

/** The document as the file the export writes and the import reads back. */
export function documentToJson(document: TEditorConfiguration): string {
  return JSON.stringify(document, null, INDENT);
}

/**
 * `error` is a translation key rather than a message, so the caller renders it
 * in the editor's own language.
 */
export type TParseResult =
  | { error: string; document?: undefined }
  | { document: TEditorConfiguration; error?: undefined };

/**
 * Reads a document back out of JSON text, checked against the registry's own
 * schema — so a document written for a different block set is refused here
 * rather than throwing on the canvas.
 */
export function parseDocumentJson(value: string, documentSchema: z.ZodTypeAny): TParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { error: 'json.error.invalidJson' };
  }

  const result = documentSchema.safeParse(parsed);
  if (!result.success) {
    return { error: 'json.error.invalidSchema' };
  }

  const document = result.data as TEditorConfiguration;
  // Rendering starts at `root` by convention; without it there is nothing to
  // draw, and the schema has no opinion about which keys exist.
  if (!document.root) {
    return { error: 'json.error.missingRoot' };
  }

  return { document };
}
