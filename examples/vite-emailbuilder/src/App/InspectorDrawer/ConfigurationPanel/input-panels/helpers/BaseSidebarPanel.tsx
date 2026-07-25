import React from 'react';

type SidebarPanelProps = {
  title: string;
  children: React.ReactNode;
};
export default function BaseSidebarPanel({ title, children }: SidebarPanelProps) {
  return (
    <div className="p-4">
      <p className="mb-4 block text-overline text-txt-secondary">{title}</p>
      <div className="mb-6 flex flex-col gap-10">{children}</div>
    </div>
  );
}
