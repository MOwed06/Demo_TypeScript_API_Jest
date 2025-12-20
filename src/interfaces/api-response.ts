import { HttpStatus } from "../enumerations";

// generalized API response
// for error event, data is undefined and error contains error message
// for healthy response, data contains response body and error is undefined
export interface ApiResponse<T> {
  status: HttpStatus;
  data?: T;
  error?: string;
}
