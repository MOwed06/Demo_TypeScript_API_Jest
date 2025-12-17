import Logger from "./logger";
import * as TimeHelper from "./time-helper";

export const displayWithTime = (message: string): void => {
  const timeStampedMessage = `${TimeHelper.getTimeMSec()} - ${message}`;
  console.log(timeStampedMessage);
  Logger.info(timeStampedMessage);
};
