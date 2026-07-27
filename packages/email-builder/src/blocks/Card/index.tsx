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
      heading: z.string().optional().nullable(),
      body: z.string().optional().nullable(),
      buttonText: z.string().optional().nullable(),
      buttonUrl: z.string().optional().nullable(),
      buttonBackgroundColor: COLOR_SCHEMA,
      buttonTextColor: COLOR_SCHEMA,
    })
    .optional()
    .nullable(),
});

export type CardProps = z.infer<typeof CardPropsSchema>;

export const CardPropsDefaults = {
  imagePosition: 'top',
  imageAlt: '',
  heading: '',
  body: '',
  buttonText: '',
  buttonUrl: '',
  buttonBackgroundColor: '#999999',
  buttonTextColor: '#FFFFFF',
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
  onClick,
}: {
  url: string;
  alt: string;
  fullWidth: boolean;
  onClick?: () => void;
}) {
  return (
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
        cursor: onClick ? 'pointer' : undefined,
      }}
      onClick={onClick}
    />
  );
}

function CardButton({
  text,
  url,
  backgroundColor,
  textColor,
  align,
}: {
  text: string;
  url: string;
  backgroundColor: string;
  textColor: string;
  align: 'left' | 'center' | 'right';
}) {
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
      <tbody>
        <tr>
          <td align={align} style={{ textAlign: align }}>
            <a
              href={url}
              target="_blank"
              style={{
                display: 'inline-block',
                color: textColor,
                backgroundColor,
                borderRadius: 4,
                padding: '12px 20px',
                fontWeight: 'bold',
                textDecoration: 'none',
              }}
            >
              {text}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function Card({ style, props, onImageClick }: CardProps & { onImageClick?: () => void }) {
  const imageUrl = props?.imageUrl ?? '';
  const imageAlt = props?.imageAlt ?? CardPropsDefaults.imageAlt;
  const imagePosition = props?.imagePosition ?? CardPropsDefaults.imagePosition;
  const heading = props?.heading ?? CardPropsDefaults.heading;
  const body = props?.body ?? CardPropsDefaults.body;
  const buttonText = props?.buttonText ?? CardPropsDefaults.buttonText;
  const buttonUrl = props?.buttonUrl ?? CardPropsDefaults.buttonUrl;
  const buttonBackgroundColor = props?.buttonBackgroundColor ?? CardPropsDefaults.buttonBackgroundColor;
  const buttonTextColor = props?.buttonTextColor ?? CardPropsDefaults.buttonTextColor;
  const textAlign = style?.textAlign ?? 'left';
  const backgroundColor = style?.backgroundColor ?? undefined;

  const contentRows = (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
      <tbody>
        {heading ? (
          <tr>
            <td style={{ paddingBottom: body || buttonText ? 8 : 0, textAlign }}>
              <h3 style={{ margin: 0, fontSize: 20, fontWeight: 'bold', textAlign }}>{heading}</h3>
            </td>
          </tr>
        ) : null}
        {body ? (
          <tr>
            <td style={{ paddingBottom: buttonText ? 16 : 0, textAlign }}>
              <p style={{ margin: 0, fontSize: 14, textAlign }}>{body}</p>
            </td>
          </tr>
        ) : null}
        {buttonText ? (
          <tr>
            <td>
              <CardButton
                text={buttonText}
                url={buttonUrl}
                backgroundColor={buttonBackgroundColor}
                textColor={buttonTextColor}
                align={textAlign}
              />
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
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
      <CardImage url={imageUrl} alt={imageAlt} fullWidth={imagePosition === 'top'} onClick={onImageClick} />
    </td>
  ) : null;

  let inner: React.JSX.Element;
  if (!imageCell || imagePosition === 'top') {
    inner = (
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
        <tbody>
          {imageCell ? <tr>{imageCell}</tr> : null}
          <tr>
            <td>{contentRows}</td>
          </tr>
        </tbody>
      </table>
    );
  } else {
    inner = (
      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" border={0} style={{ width: '100%' }}>
        <tbody>
          <tr>
            {imagePosition === 'left' ? imageCell : null}
            <td valign="top">{contentRows}</td>
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
