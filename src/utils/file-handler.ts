import fs from "fs";
import Logger from "./logger";

export const readFileAsStrings = (filePath: string): string[] => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    return data.split(/\r?\n/).filter((line) => line.trim() !== "");
  } catch (error) {
    Logger.error(`Failed to read file at ${filePath}: ${error}`);
    throw error;
  }
};
