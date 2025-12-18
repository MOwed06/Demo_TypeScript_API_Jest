/**
 * File: src/utils/logger.ts
 * Description: This file sets up a logger using tslog to capture logs as text messages to file
 * logs are stored in the logs/ folder with a timestamped filename for each run
 */

import { ILogObjMeta, Logger } from "tslog";
import * as fs from "fs";
import * as TimeHelper from "./time-helper";
import * as path from "path";
import * as Config from "../app-config.json";

// create logs directory if it doesn't exist
const dirPath = path.resolve(__dirname, "../../logs");
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

const getLogLevel = (): number => {
  const level = Config.loggingLevel.toUpperCase();

  switch (level) {
    case "TRACE:":
      return 1;
    case "DEBUG":
      return 2;
    case "WARN":
      return 4;
    default:
      return 3; // INFO
  }
};

// Create logger instance
const logger = new Logger({
  name: "FileLogger", // Name the logger instance
  type: "hidden", // Hide console output
  minLevel: getLogLevel(), // Set minimum log level
});

// create unique log file name with each run
const logFile = `./logs/log_${TimeHelper.getFormattedDateTime()}.log`;

// Helper to format log entries in plain text
function formatLogPlain(logObj: ILogObjMeta): string {
  const date = new Date(logObj._meta.date).toISOString();
  const level = logObj._meta.logLevelName;
  const filename = logObj._meta.path?.fileName ?? "unknown";
  const message = logObj[0]; // first argument passed to log
  return `[${date}] [${level}] [${filename}] ${message}`;
}

// Attach transport to write plain text logs to file
logger.attachTransport((logObj) => {
  const line = formatLogPlain(logObj);
  fs.appendFileSync(logFile, line + "\n");
});

export default logger;
