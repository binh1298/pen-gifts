import { createVngLogger } from "@/packages/logger";
import { type GlobalExtras, sentryPlugin, type User } from "./loggerPlugins";
import { getLogLevel } from "./common";

const serverLogger = createVngLogger<User, GlobalExtras>({
  appVersion: process.env.NEXT_PUBLIC_ASSETS_CDN_VERSION ?? "local",
  stdOut: console,
  logLevel: getLogLevel,
  plugins: [sentryPlugin],
  globalExtras: {
    Origin: "PEN Gifts Server",
  },
});

export default serverLogger;
