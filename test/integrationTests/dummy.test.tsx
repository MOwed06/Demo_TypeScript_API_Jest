import * as TimeHelper from "../../src/utils/time-helper";
import Logger from "../../src/utils/logger";
import TestConfig from "./test-config.json";

describe("Dummy integration test", () => {
  test("should pass", () => {
    expect(true).toBe(true);
  });

  test("should fail", () => {
    expect(false).toBe(false);
  });

  test(
    "long duration test",
    async () => {
      Logger.info(`Setting test timeout to ${TestConfig.longTestTimeout} ms`);
      Logger.info("test start");
      await await new Promise((resolve) => setTimeout(resolve, 6000));
      Logger.info("test wait end");
      expect(true).toBe(true);
    },
    TestConfig.longTestTimeout
  );
});
