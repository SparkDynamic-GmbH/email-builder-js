import React from 'react';

import { LinkButton, useEditorActions } from '@sparkdynamic/email-builder/editor';

import getConfiguration from '../../getConfiguration';

/**
 * Stays an anchor so the hash updates and the sample stays linkable; the click
 * handler swaps the document in without waiting for a hashchange reload.
 */
export default function SidebarButton({ href, children }: { href: string; children: React.ReactNode }) {
  const { resetDocument } = useEditorActions();

  const handleClick = () => {
    resetDocument(getConfiguration(href));
  };

  return (
    <LinkButton size="small" href={href} onClick={handleClick} className="w-full justify-start">
      {children}
    </LinkButton>
  );
}
