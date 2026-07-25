import React from 'react';

import { useSamplesDrawerOpen } from '../../documents/editor/EditorContext';
import { LinkButton } from '../../ui/Button';
import Drawer from '../../ui/Drawer';

import SidebarButton from './SidebarButton';
import logo from './waypoint.svg';

export const SAMPLES_DRAWER_WIDTH = 240;

export default function SamplesDrawer() {
  const samplesDrawerOpen = useSamplesDrawerOpen();

  return (
    <Drawer anchor="left" open={samplesDrawerOpen} width={SAMPLES_DRAWER_WIDTH}>
      <div className="flex h-full flex-col justify-between gap-6 overflow-auto px-4 py-2">
        <div className="flex flex-col gap-4">
          <h1 className="p-1.5 text-h6">EmailBuilder.js</h1>

          <div className="flex flex-col items-start">
            <SidebarButton href="#">Empty</SidebarButton>
            <SidebarButton href="#sample/welcome">Welcome email</SidebarButton>
            <SidebarButton href="#sample/one-time-password">One-time passcode (OTP)</SidebarButton>
            <SidebarButton href="#sample/reset-password">Reset password</SidebarButton>
            <SidebarButton href="#sample/order-ecomerce">E-commerce receipt</SidebarButton>
            <SidebarButton href="#sample/subscription-receipt">Subscription receipt</SidebarButton>
            <SidebarButton href="#sample/reservation-reminder">Reservation reminder</SidebarButton>
            <SidebarButton href="#sample/post-metrics-report">Post metrics</SidebarButton>
            <SidebarButton href="#sample/respond-to-message">Respond to inquiry</SidebarButton>
          </div>

          <hr className="border-divider" />

          <div className="flex flex-col items-start">
            <LinkButton
              size="small"
              className="w-full justify-start"
              href="https://www.usewaypoint.com/open-source/emailbuilderjs"
              target="_blank"
            >
              Learn more
            </LinkButton>
            <LinkButton
              size="small"
              className="w-full justify-start"
              href="https://github.com/usewaypoint/email-builder-js"
              target="_blank"
            >
              View on GitHub
            </LinkButton>
          </div>
        </div>

        <div className="flex flex-col gap-4 px-1.5 py-6">
          <a href="https://usewaypoint.com?utm_source=emailbuilderjs" target="_blank" className="leading-none">
            <img src={logo} width={32} alt="Waypoint" />
          </a>
          <div>
            <p className="text-overline">Looking to send emails?</p>
            <p className="text-body2 text-txt-secondary">
              Waypoint is an end-to-end email API with a &apos;pro&apos; version of this template builder with dynamic
              variables, loops, conditionals, drag and drop, layouts, and more.
            </p>
          </div>
          <LinkButton
            variant="contained"
            className="justify-center"
            href="https://usewaypoint.com?utm_source=emailbuilderjs"
            target="_blank"
          >
            Learn more
          </LinkButton>
        </div>
      </div>
    </Drawer>
  );
}
