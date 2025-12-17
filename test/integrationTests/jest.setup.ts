import Logger from "../../src/utils/logger";

export default async function globalSetup(): Promise<void> {
  Logger.info("Global setup for integration tests starting");
  await await new Promise((resolve) => setTimeout(resolve, 6000));
  Logger.info("Global setup for integration tests ready");
}
