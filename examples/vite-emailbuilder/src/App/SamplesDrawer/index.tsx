import React from 'react';

import { Drawer, useTranslate } from '@sparkdynamic/email-builder/editor';

import SidebarButton from './SidebarButton';

export const SAMPLES_DRAWER_WIDTH = 240;

/** Hash → label key; the hash is what `getConfiguration` reads. */
const SAMPLES = [
  ['#sample/empty', 'app.samples.empty'],
  ['#sample/welcome', 'app.samples.welcome'],
  ['#sample/one-time-password', 'app.samples.oneTimePassword'],
  ['#sample/reset-password', 'app.samples.resetPassword'],
  ['#sample/order-ecomerce', 'app.samples.orderEcommerce'],
  ['#sample/subscription-receipt', 'app.samples.subscriptionReceipt'],
  ['#sample/reservation-reminder', 'app.samples.reservationReminder'],
  ['#sample/post-metrics-report', 'app.samples.postMetricsReport'],
  ['#sample/respond-to-message', 'app.samples.respondToMessage'],
] as const;

export default function SamplesDrawer({ open }: { open: boolean }) {
  const t = useTranslate();

  return (
    <Drawer anchor="left" open={open} width={SAMPLES_DRAWER_WIDTH}>
      <div className="flex h-full flex-col gap-6 overflow-auto px-4 py-2">
        <div className="flex flex-col gap-4">
          <h1 className="p-1.5 text-h6">{t('app.samples.title')}</h1>

          <div className="flex flex-col items-start">
            {SAMPLES.map(([href, key]) => (
              <SidebarButton key={href} href={href}>
                {t(key)}
              </SidebarButton>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
