import type { Config } from "@jest/types";
import * as TimeHelper from "./src/utils/time-helper";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
  },
  testMatch: ["<rootDir>/**/*.test.(ts|tsx|js|jsx)"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "test/test-results",
        outputName: `results-${TimeHelper.getFormattedDateTime()}.xml`,
      },
    ],
  ],
};

export default config;
