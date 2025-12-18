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

async function main(): Promise<void> {
  try {
    displayWithTime("Application started");
    console.log("\n");

    // demonstrate database access, convert db record to app-user entity
    const userInfo03 = DbHandler.getUser(3);
    displayWithTime(`User03 info: ${JSON.stringify(userInfo03)}`);
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

    // demonstrate API call for known user
    const userDetails = await ApiMessenger.getUserDetails(
      {
        userId: Config.adminUserId,
        password: Config.defaultUserPassword,
      },
      22
    );
    console.log("User details response:", userDetails);

    // create a book review for a known book
    const bookReview = await ApiMessenger.addBookReview(
      {
        userId: "Savannah.Miller@demo.com",
        password: Config.defaultUserPassword,
      },
      12,
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
