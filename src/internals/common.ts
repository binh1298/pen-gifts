import { LOG_LEVEL } from "@/packages/logger";

export const getLogLevel = () => {
  switch (process.env.NEXT_PUBLIC_ENV) {
    case "dev":
      return LOG_LEVEL.log;
    case "sand":
    case "sandbox":
      return LOG_LEVEL.warning;
    case "prod":
    case "production":
      return LOG_LEVEL.error;
    default:
      return LOG_LEVEL.debug;
  }
};
