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
import { Genre, HttpStatus, UserRole } from "../../src/enumerations";
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
      Logger.info(expect.getState().currentTestName);
      const GENTLEMEN_MOSCOW_BOOK_KEY = 6;

      const expectedBook = DbHandler.getBook(GENTLEMEN_MOSCOW_BOOK_KEY);
      const observedBook = await ApiMessenger.getBookDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        GENTLEMEN_MOSCOW_BOOK_KEY
      );

      expect(observedBook.data?.title).toBe(expectedBook.title);
      expect(observedBook.data?.author).toBe(expectedBook.author);
      // must cast to enumeration to string for apples-to-apples comparison
      const expectedGenreString = Genre[expectedBook.genre];
      expect(observedBook.data?.genre).toBe(expectedGenreString);
      expect(observedBook.data?.isbn).toBe(expectedBook.isbn);
    },
    TestConfig.longTestTimeout
  );

  test(
    "UserDetailsDto matches AppUser entity",
    async () => {
      Logger.info(expect.getState().currentTestName);
      const ANDERSON_USER_KEY = 4;

      const expectedUser = DbHandler.getUser(ANDERSON_USER_KEY);
      const observedUser = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );
      expect(observedUser.data?.userEmail).toBe(expectedUser.userEmail);
      expect(observedUser.data?.isActive).toBe(expectedUser.isActive);
      const expectedRoleString = UserRole[expectedUser.role];
      expect(observedUser.data?.role).toBe(expectedRoleString);
      const expectedWalletString = StringHelper.toUSD(expectedUser.wallet);
      expect(observedUser.data?.wallet).toBe(expectedWalletString);
    },
    TestConfig.longTestTimeout
  );
});

describe("Access errors", () => {
  test(
    "Invalid User, Authorization Rejected",
    async () => {
      Logger.info(expect.getState().currentTestName);
      const ANDERSON_USER_KEY = 4;
      const response = await ApiMessenger.getUserDetails(
        {
          userId: "user.unknown@demo.com",
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );

      expect(response.status).toBe(HttpStatus.Unauthorized);
      expect(response.error).toContain("User not found");
    },
    TestConfig.longTestTimeout
  );

  test(
    "Invalid Password - Authorization Rejected",
    async () => {
      Logger.info(expect.getState().currentTestName);
      const ANDERSON_USER_KEY = 4;
      const response = await ApiMessenger.getUserDetails(
        {
          userId: AppConfig.adminUserId,
          password: "wrongpassword",
        },
        ANDERSON_USER_KEY
      );

      expect(response.status).toBe(HttpStatus.Unauthorized);
      expect(response.error).toContain("Invalid password");
    },
    TestConfig.longTestTimeout
  );

  test(
    "Authorization Rejection - User Details Access Denied",
    async () => {
      Logger.info(expect.getState().currentTestName);
      // a user cannot access details of another user account
      const ANDERSON_USER_KEY = 4;
      const VALID_CUSTOMER_EMAIL = "Savannah.Tucker@demo.com";
      const response = await ApiMessenger.getUserDetails(
        {
          userId: VALID_CUSTOMER_EMAIL,
          password: AppConfig.defaultUserPassword,
        },
        ANDERSON_USER_KEY
      );

      expect(response.status).toBe(HttpStatus.Forbidden);
    },
    TestConfig.longTestTimeout
  );
});

afterAll(() => {
  ProcessHandler.endProcess();
  Logger.info("Closing BigBooks API process after tests");
});
