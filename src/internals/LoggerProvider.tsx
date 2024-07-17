"use client";

import React, { useEffect, useState, type PropsWithChildren } from "react";
import { getSession } from "next-auth/react";
import { createVngLogger } from "@/packages/logger";
import { type GlobalExtras, sentryPlugin, type User } from "./loggerPlugins";
import { getLogLevel } from "./common";

type Logger = ReturnType<typeof createVngLogger<User, GlobalExtras>>;
const LoggerContext = React.createContext<Logger>(null as unknown as Logger);

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export const LoggerProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [logger] = useState<Logger>(
    createVngLogger<User, GlobalExtras>({
      appVersion: process.env.NEXT_PUBLIC_ASSETS_CDN_VERSION ?? "local",
      stdOut: { debug: noop, log: noop, warn: noop, error: noop },
      logLevel: getLogLevel,
      plugins: [sentryPlugin],
      globalExtras: {
        Origin: "PEN Gifts Client",
      },
    }),
  );

  useEffect(() => {
    logger.setStdOut(window.console);

    void getSession().then((session) => {
      console.log("session", session);
      session !== undefined && session !== null
        ? logger.setUser(session.user)
        : logger.setUser(null);
    });
  }, [logger]);

  return (
    <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>
  );
};

export const useLogger = () => {
  const logger = React.useContext(LoggerContext);

  return logger;
};
