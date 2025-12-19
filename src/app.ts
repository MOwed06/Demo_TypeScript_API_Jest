/**
 * File: app.ts
 * Description: demonstration of selected features of the BigBooks API
 * for more details, refer to: https://github.com/MOwed06/Demo_CSharp_API
 */

import Logger from "./utils/logger";
import * as ProcessHandler from "./utils/process-handler";
import * as Config from "./app-config.json";
import * as TimeHelper from "./utils/time-helper";
import * as DbHandler from "./db-handler";
import * as ApiMessenger from "./api-messenger";
import { displayWithTime } from "./utils/console-helper";
import * as RandomData from "./utils/random-data";
import { Genre, UserRole } from "./enumerations";

async function main(): Promise<void> {
  try {
    displayWithTime("Application started");
    console.log("\n");

    // launch the API process in the background
    displayWithTime(`Starting API process...`);
    const processStatus = await ProcessHandler.startProcess({
      command: Config.apiRunCommand,
      path: Config.apiProjectPath,
      delaySec: Config.apiLaunchDelaySec,
      confirmationText: Config.apiStatusMessage,
    });

    console.log(
      `${TimeHelper.getTimeMSec()} - API launched, Healthy: ${processStatus}\n`
    );

    // TODO ~ remove this

    const response1 = await ApiMessenger.requestAuthorization({
      userId: Config.adminUserId,
      password: Config.defaultUserPassword,
    });
    console.log("Authorization response:", response1);
    console.log("\n");

    const response2 = await ApiMessenger.requestAuthorization({
      userId: "somebugy@demo.com",
      password: Config.defaultUserPassword,
    });
    console.log("Authorization response:", response2);
    console.log("\n");

    // demonstrate get user details for known user
    const ANDERSON_USER_KEY = 4;
    const userDetails = await ApiMessenger.getUserDetails(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      ANDERSON_USER_KEY
    );
    console.log("User details response:", userDetails);

    // search user details for particular transaction
    const EXPECTED_TRANSACTION_DATE = "2025-03-17";
    const transactionUserDetails = userDetails.transactions.find((tx) =>
      tx.transactionDate.startsWith(EXPECTED_TRANSACTION_DATE)
    );
    // expect book 3 purchased on 2025-03-17
    console.log(
      `Transaction on ${EXPECTED_TRANSACTION_DATE}:`,
      transactionUserDetails
    );
    console.log("\n");

    // create a new book
    const newBookAddDto = {
      title: `The Adventures of ${RandomData.randomPerson()}`,
      author: RandomData.randomPerson(),
      isbn: RandomData.generateGUID(),
      description: RandomData.randomSentence(),
      genre: Genre.Fantasy,
      price: RandomData.randomDecimal(10, 100),
      stockQuantity: 50,
    };

    const newBookResponse = await ApiMessenger.addBook(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      newBookAddDto
    );
    console.log("New book response:", newBookResponse);
    console.log("\n");

    // confirm database content for added book
    const dbBookRecord = DbHandler.getBook(newBookResponse.key);
    console.log("DB book record:", dbBookRecord);
    console.log("\n");

    // create new user
    const newUserName = RandomData.randomPerson();
    const newUserAddDto = {
      userEmail: `${newUserName.replace(" ", ".")}@demo.com`,
      userName: newUserName,
      password: Config.defaultUserPassword,
      role: UserRole.Customer,
      isActive: true,
      wallet: RandomData.randomDecimal(100, 200),
    };
    const newUserResponse = await ApiMessenger.addUser(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      newUserAddDto
    );
    console.log("New user response:", newUserResponse);
    console.log("\n");

    // confirm database content for added user
    const dbUserRecord = DbHandler.getUser(newUserResponse.key);
    console.log("DB user record:", dbUserRecord.key);
    console.log("\n");

    // create a book review for a added book
    const bookReview = await ApiMessenger.addBookReview(
      {
        userId: newUserAddDto.userEmail,
        password: Config.defaultUserPassword,
      },
      newBookResponse.key,
      {
        score: 7,
        isAnonymous: false,
        description: "Great book, highly recommend!",
      }
    );
    console.log("Book review response:", bookReview);
    console.log("\n");

    // wait a bit before closing everything
    await TimeHelper.waitSeconds(2);
  } catch (error) {
    // this is bad! +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Logger.error(`Fatal error in main: ${error}`);
    console.error(`Fatal error in main: ${error}`);
  } finally {
    // close things nicely ++++++++++++++++++++++++++++++++++++++++++++++++++++
    displayWithTime("Closing background process");
    ProcessHandler.endProcess();
    displayWithTime("Application exiting");
  }
}

main();
