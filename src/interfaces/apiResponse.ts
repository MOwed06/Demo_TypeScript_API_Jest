import { HttpStatus } from "../enumerations";

export interface ApiResponse<T> {
  status: HttpStatus;
  data?: T;
  error: string;
}
