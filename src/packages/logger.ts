// Utils
type LogLevelParam = LogLevelType | (() => LogLevelType);
function getLogLevel(logLevel: LogLevelParam): LogLevelType {
  return typeof logLevel === "function" ? logLevel() : logLevel;
}

// Core
export type StdPluginLogParams<TGlobalExtras> = {
  appVersion: string;
  loglevel: keyof typeof LOG_LEVEL;
  globalExtras: TGlobalExtras;
  exception?: unknown;
  params: unknown[];
};

export type StdLogFunction = (...params: unknown[]) => void;
export type StdPluginLogFunction<TGlobalExtras> = (
  params: StdPluginLogParams<TGlobalExtras>,
) => void;

export interface StdInterface {
  debug: StdLogFunction;
  log: StdLogFunction;
  warn: StdLogFunction;
  error: StdLogFunction;
}

export type LoggerPlugin<TUser, TGlobalExtras> = {
  debug?: StdPluginLogFunction<TGlobalExtras>;
  log?: StdPluginLogFunction<TGlobalExtras>;
  warn?: StdPluginLogFunction<TGlobalExtras>;
  error?: StdPluginLogFunction<TGlobalExtras>;
  setUser?: (user: TUser | null) => void;
  setGlobalExtras?: (extras: TGlobalExtras | null) => void;
  setTags?: (tags: Record<string, string>) => void;
};

export const LOG_LEVEL = {
  debug: 0, // Use case: Log form states
  log: 1, // Use case: Log API params and responses
  warning: 2, // Use case: Log non-critical unexpected behavior such as MUI / Antd issues
  error: 3, // Use case: nextjs global-error.tsx | error.tsx | API response error
} as const;
type LogLevelType = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

const defaultFormatLog = <TGlobalExtras>(
  params: StdPluginLogParams<TGlobalExtras>,
) => params;

export const createVngLogger = <TUser, TGlobalExtras>({
  appVersion,
  stdOut: inputStdOut,
  logLevel: inputLogLevel,
  plugins = [],
  formatLog = defaultFormatLog,
  globalExtras,
}: {
  appVersion: string;
  stdOut: StdInterface;
  plugins: LoggerPlugin<TUser, TGlobalExtras>[];
  logLevel: LogLevelParam;
  globalExtras: TGlobalExtras;
  formatLog?: typeof defaultFormatLog;
}) => {
  let logLevel: LogLevelType = getLogLevel(inputLogLevel) || LOG_LEVEL.debug;
  let user: TUser | null = null;
  let extras: TGlobalExtras = globalExtras;
  let stdOut: StdInterface = inputStdOut;
  if (extras) {
    plugins.forEach((plugin) => {
      plugin.setGlobalExtras?.(extras);
    });
  }

  const logBasedOnLevel = ({
    logFunction,
    level,
    params,
    exception,
  }: {
    logFunction: keyof StdInterface;
    level: keyof typeof LOG_LEVEL;
    params: unknown[];
    exception?: StdPluginLogParams<TGlobalExtras>["exception"];
  }) => {
    if (logLevel > LOG_LEVEL[level]) return;

    const message = {
      appVersion,
      loglevel: level,
      globalExtras,
      params,
      exception,
    };

    plugins.forEach((plugin) => {
      plugin[logFunction]?.(message);
    });

    return stdOut[logFunction](formatLog(message));
  };

  return {
    getStdOut: () => stdOut,
    setStdOut: (newStdOut: StdInterface) => (stdOut = newStdOut),
    getLogLevel: () => logLevel,
    setLogLevel: (newLogLevel: LogLevelType) => {
      logLevel = newLogLevel;
    },
    getUserInfo: () => user,
    setUser: (newUserInfo: TUser | null) => {
      plugins.forEach((plugin) => {
        plugin.setUser?.(newUserInfo);
      });
      user = newUserInfo;
    },
    getGlobalExtras: () => extras,
    setGlobalExtras: (newGlobalExtras: TGlobalExtras) => {
      plugins.forEach((plugin) => {
        plugin.setGlobalExtras?.(newGlobalExtras);
      });
      extras = newGlobalExtras;
    },
    setTags: (tags: Record<string, string>) => {
      plugins.forEach((plugin) => {
        plugin.setTags?.(tags);
      });
    },

    debug: (...msgs: unknown[]) => {
      logBasedOnLevel({
        logFunction: "log",
        level: "debug",
        params: msgs,
      });
    },
    log: (...msgs: unknown[]) => {
      logBasedOnLevel({
        logFunction: "log",
        level: "log",
        params: msgs,
      });
    },
    warn: (...msgs: unknown[]) => {
      logBasedOnLevel({
        logFunction: "warn",
        level: "warning",
        params: msgs,
      });
    },
    error: <TCustomError>(
      exception: TCustomError | Error,
      ...msgs: unknown[]
    ) => {
      logBasedOnLevel({
        logFunction: "error",
        level: "error",
        params: msgs,
        exception,
      });
    },
  };
};
