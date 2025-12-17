import Database from "better-sqlite3";
import * as Config from "./app-config.json";
import Logger from "./utils/logger";
import * as Entities from "./entities/app-user";

const bigBooksDb = new Database(Config.databaseFile, {
  readonly: true, // default is false
  fileMustExist: true, // error if file doesn't exist
  timeout: 5000, // wait up to 5s for locks
  verbose: console.log, // log all SQL queries
});

export function getUser(key: number) {
  Logger.debug(`getUser: key=${key}`);
  const dbData = bigBooksDb
    .prepare("SELECT * FROM appUsers WHERE key = ?")
    .get(key);
  return new Entities.AppUser(dbData);
}
