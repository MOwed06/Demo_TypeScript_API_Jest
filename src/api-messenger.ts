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
import { ApiResponse } from "./interfaces/apiResponse";
import { HttpStatus } from "./enumerations";

const AUTH_URI = `${Config.apiBaseUrl}/api/authentication/authenticate`;
const ACCOUNTS_URI = `${Config.apiBaseUrl}/api/accounts`;
const BOOKS_URI = `${Config.apiBaseUrl}/api/books`;

// configure for self-signed certificate
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
}

// send authorization request and return full API response
export const requestAuthorization = async (
  authRequest: AuthRequest
): Promise<ApiResponse<AuthResponse>> => {
  const messageHeader = new Headers();
  messageHeader.append("Content-Type", "application/json");

  const request: RequestInit = {
    method: HttpMethod.POST,
    headers: messageHeader,
    body: JSON.stringify(authRequest),
    redirect: "follow",
  };

  const response = await fetch(AUTH_URI, request);

  if (!response.ok) {
    Logger.debug(`Auth request: ${response.status} - ${authRequest.userId}`);
    return {
      status: response.status as HttpStatus,
      data: undefined,
      error: await response.text(),
    } as ApiResponse<AuthResponse>;
  }

  // healthy response
  Logger.trace(`Auth request: ${response.status} - ${authRequest.userId}`);
  const authResponse = (await response.json()) as AuthResponse;

  return {
    status: response.status as HttpStatus,
    data: authResponse,
    error: "",
  } as ApiResponse<AuthResponse>;
};

export const transmitRequest = async <T>(
  uri: string,
  method: HttpMethod,
  authRequest: AuthRequest,
  body?: any
): Promise<ApiResponse<T>> => {
  const authResponse = await requestAuthorization(authRequest);

  // authorization failed
  if (authResponse.status !== HttpStatus.OK || !authResponse.data) {
    return {
      status: authResponse.status,
      data: undefined,
      error: authResponse.error,
    } as ApiResponse<T>;
  }

  const messageHeader = new Headers();
  messageHeader.append("Content-Type", "application/json");
  messageHeader.append("Authorization", `Bearer ${authResponse.data.token}`);

  const request: RequestInit = {
    method: method,
    headers: messageHeader,
    redirect: "follow",
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(uri, request);

  if (!response.ok) {
    Logger.debug(`request: ${response.status} - ${uri}`);
    return {
      status: response.status as HttpStatus,
      data: undefined,
      error: await response.text(),
    } as ApiResponse<T>;
  }

  // healthy response
  Logger.trace(`request: ${response.status} - ${uri}`);
  const responseData = (await response.json()) as T;

  return {
    status: response.status as HttpStatus,
    data: responseData,
    error: "",
  } as ApiResponse<T>;
};

export const getUserDetails = async (
  authRequest: AuthRequest,
  key: number
): Promise<ApiResponse<UserDetailsDto>> => {
  const uri = `${ACCOUNTS_URI}/${key}`;
  return await transmitRequest<UserDetailsDto>(
    uri,
    HttpMethod.GET,
    authRequest,
    null
  );
};

export const addBookReview = async (
  authRequest: AuthRequest,
  bookKey: number,
  reviewAddDto: BookReviewAddDto
): Promise<ApiResponse<BookReviewDto>> => {
  const uri = `${BOOKS_URI}/${bookKey}/reviews`;
  return await transmitRequest<BookReviewDto>(
    uri,
    HttpMethod.POST,
    authRequest,
    reviewAddDto
  );
};

export const addBook = async (
  authRequest: AuthRequest,
  bookAddDto: BookAddUpdateDto
): Promise<ApiResponse<BookDetailsDto>> => {
  return await transmitRequest<BookDetailsDto>(
    BOOKS_URI,
    HttpMethod.POST,
    authRequest,
    bookAddDto
  );
};

export const getBookDetails = async (
  authRequest: AuthRequest,
  bookKey: number
): Promise<ApiResponse<BookDetailsDto>> => {
  const uri = `${BOOKS_URI}/${bookKey}`;
  return await transmitRequest<BookDetailsDto>(
    uri,
    HttpMethod.GET,
    authRequest,
    null
  );
};

export const addUser = async (
  authRequest: AuthRequest,
  userDto: UserAddUpdateDto
): Promise<ApiResponse<UserDetailsDto>> => {
  return await transmitRequest<UserDetailsDto>(
    ACCOUNTS_URI,
    HttpMethod.POST,
    authRequest,
    userDto
  );
};
