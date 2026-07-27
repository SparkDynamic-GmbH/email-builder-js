import React, { CSSProperties } from 'react';
import { z } from 'zod';

const COLOR_SCHEMA = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/)
  .nullable()
  .optional();

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

export const CardPropsSchema = z.object({
  style: z
    .object({
      backgroundColor: COLOR_SCHEMA,
      borderColor: COLOR_SCHEMA,
      borderRadius: z.number().optional().nullable(),
      textAlign: z.enum(['left', 'center', 'right']).optional().nullable(),
      padding: PADDING_SCHEMA,
    })
    .optional()
    .nullable(),
  props: z
    .object({
      imageUrl: z.string().optional().nullable(),
      imageAlt: z.string().optional().nullable(),
      imagePosition: z.enum(['top', 'left', 'right']).optional().nullable(),
      childrenIds: z.array(z.string()).optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type CardProps = z.infer<typeof CardPropsSchema>;

export const CardPropsDefaults = {
  imagePosition: 'top',
  imageAlt: '',
} as const;

function getBorder(style: CardProps['style']) {
  if (!style?.borderColor) {
    return undefined;
  }
  return `1px solid ${style.borderColor}`;
}

function CardImage({
  url,
  alt,
  fullWidth,
  overlay,
}: {
  url: string;
  alt: string;
  fullWidth: boolean;
  /** Canvas-only: rendered over the image, e.g. an "open the image library" trigger. */
  overlay?: React.ReactNode;
}) {
  const img = (
    <img
      alt={alt}
      src={url}
      width={fullWidth ? '100%' : undefined}
      style={{
        display: 'block',
        width: fullWidth ? '100%' : undefined,
        height: 'auto',
        border: 'none',
        outline: 'none',
        textDecoration: 'none',
        maxWidth: '100%',
      }}
    />
  );

  if (!overlay) {
    return img;
  }

  return (
    <span
      className="group/image-overlay"
      style={{ position: 'relative', display: fullWidth ? 'block' : 'inline-block', maxWidth: '100%' }}
    >
      {img}
      {overlay}
    </span>
  );
}

type CardOwnProps = CardProps & {
  children?: React.ReactNode;
  /** Canvas-only: rendered over the card's image. */
  imageOverlay?: React.ReactNode;
};

export function Card({ style, props, children, imageOverlay }: CardOwnProps) {
  const imageUrl = props?.imageUrl ?? '';
  const imageAlt = props?.imageAlt ?? CardPropsDefaults.imageAlt;
  const imagePosition = props?.imagePosition ?? CardPropsDefaults.imagePosition;
  const textAlign = style?.textAlign ?? 'left';
  const backgroundColor = style?.backgroundColor ?? undefined;

  const contentCell = (
    <td valign="top" style={{ textAlign }}>
      {children}
    </td>
  );

  const imageCell = imageUrl ? (
    <td
      valign="top"
      width={imagePosition === 'top' ? undefined : '40%'}
      style={
        imagePosition === 'top'
          ? { paddingBottom: 16 }
          : { padding: imagePosition === 'left' ? '0 16px 0 0' : '0 0 0 16px' }
      }
    >
      <CardImage url={imageUrl} alt={imageAlt} fullWidth={imagePosition === 'top'} overlay={imageOverlay} />
    </td>
  ) : null;

  let inner: React.JSX.Element;
  if (!imageCell || imagePosition === 'top') {
    inner = (
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
        <tbody>
          {imageCell ? <tr>{imageCell}</tr> : null}
          <tr>{contentCell}</tr>
        </tbody>
      </table>
    );
  } else {
    inner = (
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            {imagePosition === 'left' ? imageCell : null}
            {contentCell}
            {imagePosition === 'right' ? imageCell : null}
          </tr>
        </tbody>
      </table>
    );
  }

  const cellStyle: CSSProperties = {
    backgroundColor,
    border: getBorder(style),
    borderRadius: style?.borderRadius ?? undefined,
    padding: getPadding(style?.padding),
  };

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
          <td style={cellStyle}>{inner}</td>
        </tr>
      </tbody>
    </table>
  );
}
