import Logger from "./utils/logger";
import * as ProcessHandler from "./utils/process-handler";
import * as Config from "./app-config.json";
import * as TimeHelper from "./utils/time-helper";
import * as DbHandler from "./db-handler";
import * as ApiMessenger from "./api-messenger";

async function main(): Promise<void> {
  console.log("Hello, World!");

  Logger.info("msg start.");

  const userInfo03 = DbHandler.getUser(3);
  console.log("User info for key=3:", userInfo03);
  console.log("User Email:", userInfo03.userEmail);

  console.log(`${TimeHelper.getTimeMSec()} - Starting API process...`);

  await ProcessHandler.startProcess(
    Config.apiRunCommand,
    Config.apiProjectPath,
    Config.apiLaunchDelaySec
  );

  console.log(`${TimeHelper.getTimeMSec()} - API started...`);

  // const authResponse = await Messenger.authenticateUser({
  //   userId: Constants.ADMIN_USER,
  //   password: Constants.DEFAULT_PASSWORD,
  // });

  // console.log("Authentication response:", authResponse);

  await TimeHelper.waitSeconds(2);

  const userDetails = await ApiMessenger.getUserDetails(
    {
      userId: Config.adminUserId,
      password: Config.defaultUserPassword,
    },
    22
  );

  console.log("User details response:", userDetails);

  await TimeHelper.waitSeconds(2);

  console.log(`${TimeHelper.getTimeMSec()} - app wait concluded...`);

  ProcessHandler.endProcess();

  // console.log("Generated GUID:", Rand.generateGUID());

  // const myArray = ["apple", "banana", "cherry", "date"];

  // // must locate the file relative to the dist output
  // const fileName = "./src/support-files/first-names.txt";
  // const fileExists = fs.existsSync(fileName);
  // console.log(`Does the file "${fileName}" exist?`, fileExists);

  // const fileContent = fs.readFileSync(fileName, "utf-8");
  // console.log(`Content of ${fileName}:`);
  // console.log(fileContent);

  // for (let i = 0; i < 20; i++) {
  //   // const randInt = Rand.randomInt(0, 9);
  //   // console.log(`Random integer ${i + 1}:`, randInt);
  //   const randomElement = Rand.selectFromArray(myArray);
  //   console.log("Randomly selected element from array:", randomElement);
  // }

  console.log("End of program.");
  Logger.info("program end.");
}

main();

// TODO : add try-catch-finally to always kill child process on error
