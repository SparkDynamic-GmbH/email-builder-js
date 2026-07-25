import React from 'react';

import { resetDocument } from '../../documents/editor/EditorContext';
import getConfiguration from '../../getConfiguration';
import { LinkButton } from '../../ui/Button';

export default function SidebarButton({ href, children }: { href: string; children: React.ReactNode }) {
  const handleClick = () => {
    resetDocument(getConfiguration(href));
  };
  return (
    <LinkButton size="small" href={href} onClick={handleClick} className="w-full justify-start">
      {children}
    </LinkButton>
  );
}
