import {
  type StdPluginLogFunction,
  type LoggerPlugin,
} from "@/packages/logger";
import * as Sentry from "@sentry/nextjs";

export interface User {
  id: string;
}

export interface GlobalExtras extends Record<string, unknown> {
  Origin: string;
}
const logFunction: StdPluginLogFunction<GlobalExtras> = ({
  exception,
  loglevel,
  params,
}) => {
  Sentry.withScope((scope) => {
    scope.setLevel(loglevel);
    if (exception) Sentry.captureException(exception);
    else Sentry.captureMessage(JSON.stringify(params));
  });
};
export const sentryPlugin: LoggerPlugin<User, GlobalExtras> = {
  warn: logFunction,
  error: logFunction,
  setUser: (user) => {
    Sentry.setUser(user);
  },
  setGlobalExtras: (extras) => {
    if (extras) Sentry.getGlobalScope().setExtras(extras);
  },
  setTags: (tags) => {
    Sentry.setTags(tags);
  },
};
