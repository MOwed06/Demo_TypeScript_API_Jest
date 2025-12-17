/**
 * File: src/api-messenger.ts
 * Description: This file contains functions to interact with the BigBooks API
 */

import * as Config from "./app-config.json";
import { AuthRequest, AuthResponse } from "./interfaces/auth-interface";
import { UserDetailsDto } from "./interfaces/account-interface";
import Logger from "./utils/logger";

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

// base function for API requests, return response body as JSON
// error handling is intentionally omitted, error resolution is handled in the calling functions
const sendRequestReadResponse = async (uri: string, request: RequestInit) => {
  const response = await fetch(uri, request);
  return await response.json();
};

// send authorization request *without* resolving response body
// this is specific for testing auth denial scenarios
export const sendAuthRequestNoResponse = async (
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

const authenticateUser = async (
  authRequest: AuthRequest
): Promise<AuthResponse> => {
  const messageHeader = new Headers();
  messageHeader.append("Content-Type", "application/json");

  const request: RequestInit = {
    method: HttpMethod.POST,
    headers: messageHeader,
    body: JSON.stringify(authRequest),
    redirect: "follow",
  };

  const response: AuthResponse = await sendRequestReadResponse(
    AUTH_URI,
    request
  );
  Logger.trace("Authentication response:", response);
  return response;
};

export const getUserDetails = async (
  authRequest: AuthRequest,
  key: number
): Promise<UserDetailsDto> => {
  const authResponse = await authenticateUser(authRequest);

  const messageHeader = new Headers();
  messageHeader.append("Content-Type", "application/json");
  messageHeader.append("Authorization", `Bearer ${authResponse.token}`);

  const request: RequestInit = {
    method: HttpMethod.GET,
    headers: messageHeader,
    redirect: "follow",
  };

  const uri = `${ACCOUNTS_URI}/${key}`;
  const response: UserDetailsDto = await sendRequestReadResponse(uri, request);
  Logger.debug("Book details response:", response);
  return response;
};
