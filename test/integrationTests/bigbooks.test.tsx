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
import { Genre, UserRole } from "../../src/enumerations";
import * as StringHelper from "../../src/utils/string-helper";

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
describe("DTO get operations match Database entities", () => {
  test(
    "BookDetailsDto matches Book entity",
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

      expect(observedBook.title).toBe(expectedBook.title);
      expect(observedBook.author).toBe(expectedBook.author);
      // must cast to enumeration to string for apples-to-apples comparison
      const expectedGenreString = Genre[expectedBook.genre];
      expect(observedBook.genre).toBe(expectedGenreString);
      expect(observedBook.isbn).toBe(expectedBook.isbn);
    },
    TestConfig.longTestTimeout
  );

  test(
    "UserDetailsDto matches AppUser entity",
    async () => {
      Logger.info(test.name);
      const ANDERSON_USER_KEY = 4;

      const expectedUser = DbHandler.getUser(ANDERSON_USER_KEY);
      const observedUser = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      expect(observedUser.userEmail).toBe(expectedUser.userEmail);
      expect(observedUser.isActive).toBe(expectedUser.isActive);
      const expectedRoleString = UserRole[expectedUser.role];
      expect(observedUser.role).toBe(expectedRoleString);
      const expectedWalletString = StringHelper.toUSD(expectedUser.wallet);
      expect(observedUser.wallet).toBe(expectedWalletString);
    },
    TestConfig.longTestTimeout
  );
});

describe("Big books integration suite 2", () => {
  test(
    "dsafadsf",
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
