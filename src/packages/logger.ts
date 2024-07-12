// Utils
type LogLevelParam = LogLevelType | (() => LogLevelType);
function getLogLevel(logLevel: LogLevelParam): LogLevelType {
  return typeof logLevel === "function" ? logLevel() : logLevel;
}

// Core
export type StdLogFunction = (...params: unknown[]) => void;
export type StdPerformanceResult = {
  time: number;
  result?: unknown;
  error?: unknown;
};

export interface StdInterface {
  debug: StdLogFunction;
  log: StdLogFunction;
  warn: StdLogFunction;
  error: StdLogFunction;
}

export type LoggerPlugin = {
  debug?: StdLogFunction;
  log?: StdLogFunction;
  warn?: StdLogFunction;
  error?: StdLogFunction;
  logPerformance?: (name: string, promise: Promise<unknown>) => Promise<void>;
};

export const LOG_LEVEL = {
  DEBUG: 0, // Use case: Log form states
  LOG: 1, // Use case: Log API params and responses
  WARN: 2, // Use case: Log non-critical unexpected behavior such as MUI / Antd issues
  ERROR: 3, // Use case: nextjs global-error.tsx | error.tsx | API response error
} as const;
type LogLevelType = (typeof LOG_LEVEL)[keyof typeof LOG_LEVEL];

const defaultFormatLog = (
  appVersion: string,
  prefix: string,
  loglevel: keyof typeof LOG_LEVEL,
  params: unknown[],
) => [`[${prefix}] [${appVersion}] [${loglevel}]:`, ...params];

export const createVngLogger = ({
  appVersion,
  stdOut,
  logLevel: inputLogLevel,
  plugins = [],
  prefix = "",
  formatLog = defaultFormatLog,
}: {
  appVersion: string;
  stdOut: StdInterface;
  plugins: LoggerPlugin[];
  logLevel: LogLevelParam;
  prefix: string;
  formatLog?: typeof defaultFormatLog;
}) => {
  let logLevel: LogLevelType = getLogLevel(inputLogLevel) || LOG_LEVEL.DEBUG;

  const logBasedOnLevel = (
    logFunction: keyof StdInterface,
    level: keyof typeof LOG_LEVEL,
    params: unknown[],
  ) => {
    console.log("logLevel", logLevel, level, params);
    if (logLevel > LOG_LEVEL[level]) return;

    const formattedMsg = formatLog(appVersion, prefix, level, params);
    console.log("fm msg", formattedMsg);

    plugins.forEach((plugin) => {
      plugin[logFunction]?.(...formattedMsg);
    });
    return stdOut[logFunction](...params);
  };

  return {
    getLogLevel: () => logLevel,
    setLogLevel: (newLogLevel: LogLevelType) => {
      logLevel = newLogLevel;
    },
    debug: (...msgs: unknown[]) => {
      logBasedOnLevel("debug", "DEBUG", msgs);
    },
    log: (...msgs: unknown[]) => {
      logBasedOnLevel("log", "LOG", msgs);
    },
    warn: (...msgs: unknown[]) => {
      logBasedOnLevel("warn", "WARN", msgs);
    },
    error: (...msgs: unknown[]) => {
      logBasedOnLevel("error", "ERROR", msgs);
    },
    async logPerformance<T>(
      name: string,
      promise: Promise<T>,
    ): Promise<StdPerformanceResult> {
      plugins.forEach((plugin) => {
        plugin.logPerformance?.(name, promise);
      });
      const startTime = Date.now();
      try {
        const result = await promise;
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        return { time: elapsedTime, result };
      } catch (error) {
        const endTime = Date.now();
        const elapsedTime = endTime - startTime;
        return { time: elapsedTime, error };
      }
    },
  };
};
