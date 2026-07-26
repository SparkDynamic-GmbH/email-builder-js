import React, { CSSProperties } from 'react';
import { z } from 'zod';

export const SpacerPropsSchema = z.object({
  props: z
    .object({
      height: z.number().gte(0).optional().nullish(),
    })
    .optional()
    .nullable(),
});

export type SpacerProps = z.infer<typeof SpacerPropsSchema>;

export const SpacerPropsDefaults = {
  height: 16,
};

export function Spacer({ props }: SpacerProps) {
  const height = props?.height ?? SpacerPropsDefaults.height;
  // An empty cell collapses in Outlook, so the height is held by a non-breaking space with the
  // line-height set to match and the font shrunk so the glyph itself cannot make the row taller.
  const style: CSSProperties = {
    height,
    lineHeight: `${height}px`,
    fontSize: '1px',
  };
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
      <tbody>
        <tr>
          <td height={height} style={style}>
            &nbsp;
          </td>
        </tr>
      </tbody>
    </table>
  );
}
