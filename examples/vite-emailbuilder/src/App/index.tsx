import React, { useState } from 'react';

import { INSPECTOR_DRAWER_WIDTH, InspectorDrawer, useInspectorDrawerOpen } from '@sparkdynamic/email-builder/editor';

import SamplesDrawer, { SAMPLES_DRAWER_WIDTH } from './SamplesDrawer';
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
  // The samples gallery is the host app's own chrome, so its state lives here
  // rather than in the editor store.
  const [samplesDrawerOpen, setSamplesDrawerOpen] = useState(true);

  return (
    <>
      <InspectorDrawer />
      <SamplesDrawer open={samplesDrawerOpen} />

      <div
        className="flex flex-col"
        style={{
          marginRight: inspectorDrawerOpen ? INSPECTOR_DRAWER_WIDTH : 0,
          marginLeft: samplesDrawerOpen ? SAMPLES_DRAWER_WIDTH : 0,
          transition: [
            drawerTransition('margin-left', samplesDrawerOpen),
            drawerTransition('margin-right', inspectorDrawerOpen),
          ].join(', '),
        }}
      >
        <TemplatePanel
          samplesDrawerOpen={samplesDrawerOpen}
          onToggleSamplesDrawer={() => setSamplesDrawerOpen((open) => !open)}
        />
      </div>
    </>
  );
}
