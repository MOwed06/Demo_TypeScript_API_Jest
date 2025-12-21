/**
 * File: src/api-messenger.ts
 * Description: This file contains functions to interact with the BigBooks API
 * To allow full interaction with the API, API returns are wrapped in ApiResponse<T>
 * which includes status, data, and error information.
 */

import * as Config from './app-config.json';
import { AuthRequest, AuthResponse } from './interfaces/auth-interface';
import { UserAddUpdateDto, UserDetailsDto } from './interfaces/account-interface';
import Logger from './utils/logger';
import { BookReviewDto, BookReviewAddDto } from './interfaces/book-reviews-interface';
import { BookAddUpdateDto, BookDetailsDto, BookOverviewDto } from './interfaces/book-interface';
import { ApiResponse } from './interfaces/api-response';
import { HttpStatus, HttpMethod } from './enumerations';
import { PurchaseRequestDto } from './interfaces/transactions-interface';

const AUTH_URI = `${Config.apiBaseUrl}/api/authentication/authenticate`;
const ACCOUNTS_URI = `${Config.apiBaseUrl}/api/accounts`;
const USERS_URI = `${Config.apiBaseUrl}/api/users`;
const BOOKS_URI = `${Config.apiBaseUrl}/api/books`;
const TRANSACTIONS_URI = `${Config.apiBaseUrl}/api/transactions`;

// ignore invalid SSL certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// refer to AuthService.cs, GenerateToken()
const requestAuthorization = async (
  authRequest: AuthRequest
): Promise<ApiResponse<AuthResponse>> => {
  const messageHeader = new Headers();
  messageHeader.append('Content-Type', 'application/json');

  const request: RequestInit = {
    method: HttpMethod.POST,
    headers: messageHeader,
    body: JSON.stringify(authRequest),
    redirect: 'follow',
  };

  const response = await fetch(AUTH_URI, request);

  if (!response.ok) {
    Logger.debug(`Auth request: ${response.status} - ${authRequest.userId}`);
    return {
      status: response.status as HttpStatus,
      data: undefined,
      error: await response.text(), // populate error with un-parsed response text
    } as ApiResponse<AuthResponse>;
  }

  // healthy response
  Logger.trace(`Auth request: ${response.status} - ${authRequest.userId}`);
  const authResponse = (await response.json()) as AuthResponse;

  return {
    status: response.status as HttpStatus,
    data: authResponse,
    error: undefined,
  } as ApiResponse<AuthResponse>;
};

// generalized request transmitter
// handles authorization and transmits request using response token
export const transmitRequest = async <TOutput, TInput = undefined>(
  uri: string,
  method: HttpMethod,
  authRequest: AuthRequest,
  body?: TInput
): Promise<ApiResponse<TOutput>> => {
  const authResponse = await requestAuthorization(authRequest);

  // if authorization failed, pass back the failure response
  if (authResponse.status !== HttpStatus.OK || !authResponse.data) {
    return {
      status: authResponse.status,
      data: undefined,
      error: authResponse.error,
    } as ApiResponse<TOutput>;
  }

  const messageHeader = new Headers();
  messageHeader.append('Content-Type', 'application/json');
  messageHeader.append('Authorization', `Bearer ${authResponse.data.token}`);

  const request: RequestInit = {
    method: method,
    headers: messageHeader,
    redirect: 'follow',
    body: body ? JSON.stringify(body) : undefined,
  };

  const response = await fetch(uri, request);

  if (!response.ok) {
    Logger.debug(`request: ${response.status} - ${uri}`);
    return {
      status: response.status as HttpStatus,
      data: undefined,
      error: await response.text(),
    } as ApiResponse<TOutput>;
  }

  // healthy response
  Logger.trace(`request: ${response.status} - ${uri}`);
  const responseData = (await response.json()) as TOutput;

  return {
    status: response.status as HttpStatus,
    data: responseData,
    error: undefined,
  } as ApiResponse<TOutput>;
};

// refer to AccountsController.cs, GetAccountInfo()
export const getUserDetails = async (
  authRequest: AuthRequest,
  key: number
): Promise<ApiResponse<UserDetailsDto>> => {
  const uri = `${ACCOUNTS_URI}/${key}`;
  return await transmitRequest<UserDetailsDto>(uri, HttpMethod.GET, authRequest, undefined);
};

// refer to UsersController.cs, GetCurrentUser()
export const getCurrentUserDetails = async (
  authRequest: AuthRequest
): Promise<ApiResponse<UserDetailsDto>> => {
  return await transmitRequest<UserDetailsDto>(USERS_URI, HttpMethod.GET, authRequest, undefined);
};

// refer to BookReviewsController.cs, AddBookReview()
export const addBookReview = async (
  authRequest: AuthRequest,
  bookKey: number,
  reviewAddDto: BookReviewAddDto
): Promise<ApiResponse<BookReviewDto>> => {
  const uri = `${BOOKS_URI}/${bookKey}/reviews`;
  return await transmitRequest<BookReviewDto, BookReviewAddDto>(
    uri,
    HttpMethod.POST,
    authRequest,
    reviewAddDto
  );
};

// refer to BooksController.cs, AddBook()
export const addBook = async (
  authRequest: AuthRequest,
  bookAddDto: BookAddUpdateDto
): Promise<ApiResponse<BookDetailsDto>> => {
  return await transmitRequest<BookDetailsDto, BookAddUpdateDto>(
    BOOKS_URI,
    HttpMethod.POST,
    authRequest,
    bookAddDto
  );
};

// refer to BooksController.cs, GetBook()
export const getBookDetails = async (
  authRequest: AuthRequest,
  bookKey: number
): Promise<ApiResponse<BookDetailsDto>> => {
  const uri = `${BOOKS_URI}/${bookKey}`;
  return await transmitRequest<BookDetailsDto>(uri, HttpMethod.GET, authRequest, undefined);
};

// refer to AccountsController.cs, AddAccount()
export const addUser = async (
  authRequest: AuthRequest,
  userDto: UserAddUpdateDto
): Promise<ApiResponse<UserDetailsDto>> => {
  return await transmitRequest<UserDetailsDto, UserAddUpdateDto>(
    ACCOUNTS_URI,
    HttpMethod.POST,
    authRequest,
    userDto
  );
};

// refer to BooksController.cs, GetBooksByGenre
export const getBooksByGenre = async (
  authRequest: AuthRequest,
  genre: string
): Promise<ApiResponse<BookOverviewDto[]>> => {
  const uri = `${BOOKS_URI}/genre?name=${genre}`;
  return await transmitRequest<BookOverviewDto[]>(uri, HttpMethod.GET, authRequest, undefined);
};

// refer to TransactionsController.cs, PurchaseBooks()
export const purchaseBooks = async (
  authRequest: AuthRequest,
  purchaseDto: PurchaseRequestDto
): Promise<ApiResponse<UserDetailsDto>> => {
  const uri = `${TRANSACTIONS_URI}/purchase`;
  return await transmitRequest<UserDetailsDto, PurchaseRequestDto>(
    uri,
    HttpMethod.POST,
    authRequest,
    purchaseDto
  );
};
