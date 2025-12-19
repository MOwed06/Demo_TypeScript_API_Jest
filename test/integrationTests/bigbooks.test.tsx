/**
 * File: bigbooks.test.tsx
 * Description: demonstration of end-to-end tests for big books API.
 */

import Logger from "../../src/utils/logger";
import TestConfig from "../test-config.json";
import AppConfig from "../../src/app-config.json";
import * as ProcessHandler from "../../src/utils/process-handler";
import * as DbHandler from "../../src/db-handler";
import * as ApiMessenger from "../../src/api-messenger";

// calculate delay to allow API to launch, add 2 seconds buffer
const BACKGROUND_APP_LAUNCH_DELAY_MS =
  AppConfig.apiLaunchDelaySec * 1000 + 5000;

// launch BigBooks server before tests
beforeAll(async () => {
  const processStatus = await ProcessHandler.startProcess({
    command: AppConfig.apiRunCommand,
    path: AppConfig.apiProjectPath,
    delaySec: AppConfig.apiLaunchDelaySec,
    confirmationText: AppConfig.apiStatusMessage,
  });
  Logger.info(`BigBooks API launched, Healthy: ${processStatus}`);
}, BACKGROUND_APP_LAUNCH_DELAY_MS);

// The DTO objects returned by API calls are related to
// but separate from the database entities.
// This suite confirms the validity of the DTO objects.
describe("DTO get operations", () => {
  test(
    "get book matches book entity",
    async () => {
      Logger.info(test.name);
      const GENTLEMEN_MOSCOW_BOOK_KEY = 6;

      const expectedBook = DbHandler.getBook(GENTLEMEN_MOSCOW_BOOK_KEY);
      const observedBook = await ApiMessenger.getBookDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        GENTLEMEN_MOSCOW_BOOK_KEY
      );

      Logger.debug(expectedBook.title);
      Logger.debug(observedBook.title);
      expect(observedBook.title).toBe(expectedBook.title);
      expect(observedBook.author).toBe(expectedBook.author);
      expect(observedBook.genre).toBe(expectedBook.genre);
      expect(observedBook.isbn).toBe(expectedBook.isbn);
    },
    TestConfig.longTestTimeout
  );

  test(
    "test 102",
    () => {
      Logger.info("Running test 102");
      expect(true).toBe(true);
    },
    TestConfig.longTestTimeout
  );
});

describe("Big books integration suite 2", () => {
  test(
    "test 201",
    () => {
      Logger.info("Running test 201");
      expect(true).toBe(true);
    },
    TestConfig.longTestTimeout
  );

  test(
    "test 202",
    () => {
      Logger.info("Running test 202");
      expect(true).toBe(true);
    },
    TestConfig.longTestTimeout
  );

  test(
    "test 203",
    async () => {
      Logger.info("Running test 203 with delay");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      expect(true).toBe(true);
    },
    TestConfig.longTestTimeout
  );
});

afterAll(() => {
  ProcessHandler.endProcess();
  Logger.info("Closing BigBooks API process after tests");
});
