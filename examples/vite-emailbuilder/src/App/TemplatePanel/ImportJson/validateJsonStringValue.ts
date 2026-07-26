import { EditorConfigurationSchema, TEditorConfiguration } from '../../../registry';

/** `error` is a translation key, so the caller renders it in the active language. */
type TResult = { error: string; data?: undefined } | { data: TEditorConfiguration; error?: undefined };

export default function validateTextAreaValue(value: string): TResult {
  let jsonObject = undefined;
  try {
    jsonObject = JSON.parse(value);
  } catch {
    return { error: 'app.import.invalidJson' };
  }

  const parseResult = EditorConfigurationSchema.safeParse(jsonObject);
  if (!parseResult.success) {
    return { error: 'app.import.invalidSchema' };
  }

  if (!parseResult.data.root) {
    return { error: 'app.import.missingRoot' };
  }

  return { data: parseResult.data };
}
