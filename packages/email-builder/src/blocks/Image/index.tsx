import React, { CSSProperties } from 'react';
import { z } from 'zod';

const PADDING_SCHEMA = z
  .object({
    top: z.number(),
    bottom: z.number(),
    right: z.number(),
    left: z.number(),
  })
  .optional()
  .nullable();

const getPadding = (padding: z.infer<typeof PADDING_SCHEMA>) =>
  padding ? `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px` : undefined;

export const ImagePropsSchema = z.object({
  style: z
    .object({
      padding: PADDING_SCHEMA,
      backgroundColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional()
        .nullable(),
      textAlign: z.enum(['center', 'left', 'right']).optional().nullable(),
    })
    .optional()
    .nullable(),
  props: z
    .object({
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
      url: z.string().optional().nullable(),
      alt: z.string().optional().nullable(),
      linkHref: z.string().optional().nullable(),
      contentAlignment: z.enum(['top', 'middle', 'bottom']).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ImageProps = z.infer<typeof ImagePropsSchema>;

export function Image({ style, props, onImageClick }: ImageProps & { onImageClick?: () => void }) {
  const backgroundColor = style?.backgroundColor ?? undefined;
  const textAlign = style?.textAlign ?? undefined;
  const cellStyle: CSSProperties = {
    padding: getPadding(style?.padding),
    backgroundColor,
    textAlign,
  };

  const linkHref = props?.linkHref ?? null;
  const width = props?.width ?? undefined;
  const height = props?.height ?? undefined;

  const imageElement = (
    <img
      alt={props?.alt ?? ''}
      src={props?.url ?? ''}
      width={width}
      height={height}
      style={{
        width,
        height,
        outline: 'none',
        border: 'none',
        textDecoration: 'none',
        verticalAlign: props?.contentAlignment ?? 'middle',
        display: 'inline-block',
        maxWidth: '100%',
        cursor: onImageClick ? 'pointer' : undefined,
      }}
      onClick={
        onImageClick
          ? (ev) => {
              ev.preventDefault();
              ev.stopPropagation();
              onImageClick();
            }
          : undefined
      }
    />
  );

  return (
    <table
      role="presentation"
      width="100%"
      cellPadding="0"
      cellSpacing="0"
      border={0}
      bgcolor={backgroundColor}
      style={{ width: '100%' }}
    >
      <tbody>
        <tr>
          <td align={textAlign} style={cellStyle}>
            {linkHref ? (
              <a href={linkHref} style={{ textDecoration: 'none' }} target="_blank">
                {imageElement}
              </a>
            ) : (
              imageElement
            )}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
