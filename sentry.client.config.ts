// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

console.log(
  "HAHAHAHAHAHAHA fm sentry dsn client",
  process.env.NEXT_PUBLIC_ENV,
  process.env.NEXT_PUBLIC_SENTRY_DSN,
  process.env.NEXT_PUBLIC_ASSETS_CDN_VERSION,
);
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_ENV,
  release: process.env.NEXT_PUBLIC_ASSETS_CDN_VERSION ?? "local",
  enableTracing: true,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // debug: process.env.NEXT_PUBLIC_ENV === "development",

  replaysOnErrorSampleRate: 1.0,

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  // replaysSessionSampleRate:
  //   process.env.NEXT_PUBLIC_ENV === "development" ? 1.0 : 0.1,
  replaysSessionSampleRate: 1.0,

  // You can remove this option if you're not planning to use the Sentry Session Replay feature:
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here, for example:
      maskAllText: true,
      blockAllMedia: true,
      unmask: [".unmask-element"],
    }),
  ],
});
