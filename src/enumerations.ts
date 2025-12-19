export enum UserRole {
  Customer = 0,
  Admin = -1,
}

export enum Genre {
  Undefined = -1,
  Fiction = 1,
  Childrens = 2,
  Fantasy = 3,
  Mystery = 4,
  History = 5,
  Biography = 7,
  Hobbies = 8,
  SelfHelp = 9,
  Romance = 10,
}

export enum TransactionType {
  Purchase = -1,
  Deposit = -2,
}

export enum HttpStatus {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
}
