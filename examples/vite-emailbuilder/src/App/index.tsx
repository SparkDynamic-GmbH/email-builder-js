import React from 'react';

import { useInspectorDrawerOpen } from '../documents/editor/EditorContext';

import InspectorDrawer, { INSPECTOR_DRAWER_WIDTH } from './InspectorDrawer';
import TemplatePanel from './TemplatePanel';

/**
 * MUI's transition helper, inlined: leaving the screen is faster and uses a
 * sharp easing, entering is slower and eases out.
 */
function drawerTransition(property: 'margin-left' | 'margin-right', open: boolean) {
  return open ? `${property} 225ms var(--ease-out)` : `${property} 195ms var(--ease-sharp)`;
}

export default function App() {
  const inspectorDrawerOpen = useInspectorDrawerOpen();

  return (
    <>
      <InspectorDrawer />

      <div
        className="flex flex-col"
        style={{
          marginRight: inspectorDrawerOpen ? INSPECTOR_DRAWER_WIDTH : 0,
          transition: drawerTransition('margin-right', inspectorDrawerOpen),
        }}
      >
        <TemplatePanel />
      </div>
    </>
  );
}
