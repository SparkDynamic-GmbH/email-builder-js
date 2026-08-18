import { Download } from 'lucide-react';
import React, { useMemo } from 'react';

import { useDocument } from '../EditorContext';
import { useTranslate } from '../i18n';
import { IconLinkButton } from '../ui/IconButton';
import Tooltip from '../ui/Tooltip';

import { documentToJson } from './helpers';

type Props = {
  /** Name the download is offered under. Defaults to `email-template.json`. */
  fileName?: string;
};

/**
 * Downloads the current document as JSON — the same text `ImportJsonButton`
 * reads back. Host chrome, like `SaveButton`.
 */
export default function ExportJsonButton({ fileName = 'email-template.json' }: Props) {
  const t = useTranslate();
  const document = useDocument();

  // A data URI rather than an object URL: nothing to revoke, and the href can
  // simply follow the document.
  const href = useMemo(
    () => `data:application/json;charset=utf-8,${encodeURIComponent(documentToJson(document))}`,
    [document]
  );

  return (
    <Tooltip title={t('json.export')}>
      <IconLinkButton href={href} download={fileName} aria-label={t('json.export')}>
        <Download className="size-5" />
      </IconLinkButton>
    </Tooltip>
  );
}
