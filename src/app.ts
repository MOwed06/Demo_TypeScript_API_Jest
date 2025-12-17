import Logger from "./utils/logger";
import * as ProcessHandler from "./utils/process-handler";
import * as Config from "./app-config.json";
import * as TimeHelper from "./utils/time-helper";
import * as DbHandler from "./db-handler";
import * as ApiMessenger from "./api-messenger";
import * as ConsoleHelper from "./utils/console-helper";

// application main includes only a basic demonstration
// of selected features of the BigBooks API
// refer to the integrationTests folder for more complete examples
async function main(): Promise<void> {
  try {
    ConsoleHelper.displayWithTime("Application started");

    // demonstrate database access
    const userInfo03 = DbHandler.getUser(3);
    console.log("User info for key=3:", userInfo03);
    console.log("User Email:", userInfo03.userEmail);

    // launch the API process in the background
    console.log(`${TimeHelper.getTimeMSec()} - Starting API process...`);
    const processStatus = await ProcessHandler.startProcess(
      Config.apiRunCommand,
      Config.apiProjectPath,
      Config.apiLaunchDelaySec,
      Config.apiStatusMessage
    );

    console.log(
      `${TimeHelper.getTimeMSec()} - API launched, Status: ${processStatus}`
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

    // wait a bit before closing everything
    await TimeHelper.waitSeconds(2);
  } catch (error) {
    // this is bad! +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    Logger.error(`Fatal error in main: ${error}`);
    console.error(`Fatal error in main: ${error}`);
  } finally {
    // close things nicely ++++++++++++++++++++++++++++++++++++++++++++++++++++
    ConsoleHelper.displayWithTime("Closing background process");
    ProcessHandler.endProcess();
    ConsoleHelper.displayWithTime("Application exiting");
  }
}

main();
