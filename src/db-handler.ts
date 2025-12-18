import Database from "better-sqlite3";
import * as Config from "./app-config.json";
import Logger from "./utils/logger";
import * as Entities from "./entities/db-objects";

const sqlLogger = (message?: unknown, ...additionalArgs: unknown[]) => {
  Logger.debug(`SQL Query: ${message}`);
};

const bigBooksDb = new Database(Config.databaseFile, {
  readonly: true, // default is false
  fileMustExist: true, // error if file doesn't exist
  timeout: 5000, // wait up to 5s for locks
  verbose: sqlLogger,
});

export function getUser(key: number) {
  Logger.debug(`getUser: key=${key}`);
  const dbData = bigBooksDb
    .prepare("SELECT * FROM appUsers WHERE key = ?")
    .get(key);
  if (!dbData) {
    throw new Error(`User with key=${key} not found`);
  }

  return new Entities.AppUser(dbData);
}

export function getBook(key: number) {
  Logger.debug(`getBook: key=${key}`);
  const dbData = bigBooksDb
    .prepare("SELECT * FROM books WHERE key = ?")
    .get(key);
  if (!dbData) {
    throw new Error(`Book with key=${key} not found`);
  }

  return new Entities.Book(dbData);
}
