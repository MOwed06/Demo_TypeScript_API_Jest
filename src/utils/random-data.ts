import * as FileHandler from './file-handler';
import { randomUUID } from 'crypto';

const FIRST_NAMES: string[] = FileHandler.readFileAsStrings('./src/data/first-names.txt');

const FAMILY_NAMES: string[] = FileHandler.readFileAsStrings('./src/data/family-names.txt');

const SENTENCES: string[] = FileHandler.readFileAsStrings('./src/data/poetry-rfrost.txt');

/// Returns true with the given percentage chance (0-100)
export const probability = (percentage: number): boolean => {
  return Math.random() * 100.0 < percentage;
};

export const generateGUID = (): string => {
  return randomUUID().toUpperCase();
};

/// Returns a random integer in the range
// [min, max) - including min, excluding max
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const selectFromArray = <T>(arr: T[]): T => {
  const index = randomInt(0, arr.length);
  return arr[index];
};

export const randomDecimal = (min: number, max: number): number => {
  const DECIMAL_PLACES = 2;
  const factor = Math.pow(10, DECIMAL_PLACES);
  const randomValue = Math.random() * (max - min) + min;
  return Math.floor(randomValue * factor) / factor;
};

export const randomPerson = (): string => {
  const firstName = selectFromArray(FIRST_NAMES);
  const familyName = selectFromArray(FAMILY_NAMES);
  return `${firstName} ${familyName}`;
};

export const randomSentence = (): string => {
  return selectFromArray(SENTENCES);
};
