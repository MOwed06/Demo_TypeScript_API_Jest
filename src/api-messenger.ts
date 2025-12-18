/**
 * File: src/api-messenger.ts
 * Description: This file contains functions to interact with the BigBooks API
 * To allow full interaction with the API, this module includes both methods
 * which do and do not handle the response body.
 * Methods prefixed with "transmit" do not handle the response body.
 * Methods prefixed with "send" do resolve the response body as JSON.
 */

import * as Config from "./app-config.json";
import { AuthRequest, AuthResponse } from "./interfaces/auth-interface";
import {
  UserAddUpdateDto,
  UserDetailsDto,
} from "./interfaces/account-interface";
import Logger from "./utils/logger";
import {
  BookReviewDto,
  BookReviewAddDto,
} from "./interfaces/book-reviews-interface";
import { BookAddUpdateDto, BookDetailsDto } from "./interfaces/book-interface";

const AUTH_URI = `${Config.apiBaseUrl}/api/authentication/authenticate`;
const ACCOUNTS_URI = `${Config.apiBaseUrl}/api/accounts`;
const BOOKS_URI = `${Config.apiBaseUrl}/api/books`;
const TRANSACTIONS_URI = `${Config.apiBaseUrl}/api/transactions`;

// configure for self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
}

export const transmitAuthorizationRequest = async (
  authRequest: AuthRequest
): Promise<Response> => {
  const messageHeader = new Headers();
  messageHeader.append("Content-Type", "application/json");

  const request: RequestInit = {
    method: HttpMethod.POST,
    headers: messageHeader,
    body: JSON.stringify(authRequest),
    redirect: "follow",
  };

  return await fetch(AUTH_URI, request);
};

export const sendAuthorizationRequest = async (
  authRequest: AuthRequest
): Promise<AuthResponse> => {
  const response = await transmitAuthorizationRequest(authRequest);

  if (!response.ok) {
    Logger.info(`Auth request: ${response.status} - ${authRequest.userId}`);
  }

  return (await response.json()) as AuthResponse;
};

const sendAuthorizedRequest = async <T>(
  uri: string,
  method: HttpMethod,
  authRequest: AuthRequest,
  body?: any
): Promise<T> => {
  const authResponse = await sendAuthorizationRequest(authRequest);

  const messageHeader = new Headers();
  messageHeader.append("Content-Type", "application/json");
  messageHeader.append("Authorization", `Bearer ${authResponse.token}`);

  const request: RequestInit = {
    method: method,
    headers: messageHeader,
    redirect: "follow",
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(uri, request);
  if (!response.ok) {
    Logger.info(`request: ${response.status} - ${uri}`);
  }

  return (await response.json()) as T;
};

export const getUserDetails = async (
  authRequest: AuthRequest,
  key: number
): Promise<UserDetailsDto> => {
  const uri = `${ACCOUNTS_URI}/${key}`;
  const response: UserDetailsDto = await sendAuthorizedRequest(
    uri,
    HttpMethod.GET,
    authRequest,
    null
  );
  return response;
};

export const addBookReview = async (
  authRequest: AuthRequest,
  bookKey: number,
  reviewAddDto: BookReviewAddDto
): Promise<BookReviewDto> => {
  const uri = `${BOOKS_URI}/${bookKey}/reviews`;
  const response: BookReviewDto = await sendAuthorizedRequest(
    uri,
    HttpMethod.POST,
    authRequest,
    reviewAddDto
  );
  return response;
};

export const addBook = async (
  authRequest: AuthRequest,
  bookAddDto: BookAddUpdateDto
): Promise<BookDetailsDto> => {
  const response: BookDetailsDto = await sendAuthorizedRequest(
    BOOKS_URI,
    HttpMethod.POST,
    authRequest,
    bookAddDto
  );
  return response;
};

export const addUser = async (
  authRequest: AuthRequest,
  userDto: UserAddUpdateDto
): Promise<UserDetailsDto> => {
  const response: UserDetailsDto = await sendAuthorizedRequest(
    ACCOUNTS_URI,
    HttpMethod.POST,
    authRequest,
    userDto
  );
  return response;
};
