import logger from "./logger";

// return timestamp string in "YYYYMMDDHHMMSS" format
// if no timeValue is provided, use current date and time
export function getFormattedDateTime(timeValue?: Date): string {
  const referenceTime = timeValue || new Date();

  const year = referenceTime.getFullYear();
  const month = String(referenceTime.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(referenceTime.getDate()).padStart(2, "0");
  const hours = String(referenceTime.getHours()).padStart(2, "0");
  const minutes = String(referenceTime.getMinutes()).padStart(2, "0");
  const seconds = String(referenceTime.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// return timestamp string in "HH:MM:SS.mmm" format
export function getTimeMSec(timeValue?: Date): string {
  const referenceTime = timeValue || new Date();
  const baseTimeString = referenceTime.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const mSecTimeString = referenceTime
    .getMilliseconds()
    .toString()
    .padStart(3, "0");
  return `${baseTimeString}.${mSecTimeString}`;
}

// wait for specified number of seconds and add log entry
export function waitSeconds(timeSec: number): Promise<void> {
  const mSec = timeSec * 1000;
  logger.debug(`Waiting for ${timeSec} seconds...`);
  return new Promise((resolve) => setTimeout(resolve, mSec));
}
