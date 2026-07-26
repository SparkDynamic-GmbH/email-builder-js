import React from 'react';

import { Image, ImageProps } from '@sparkdynamic/email-builder';

const PLACEHOLDER_URL = 'https://placehold.co/600x400@2x/F8F8F8/CCC?text=Your%20image';

/** Stands a placeholder in on the canvas until the block has a real image url. */
export default function ImageEditor({ style, props }: ImageProps) {
  return <Image style={style} props={{ ...props, url: props?.url ?? PLACEHOLDER_URL }} />;
}
