import * as Enum from "../enumerations";
import { TransactionDto } from "./transactions-interface";

// corresponds to BigBooks.API.Models.UserDetailsDto.cs
export interface UserDetailsDto {
  key: number;
  role: Enum.UserRole;
  userEmail: string;
  userName: string;
  isActive: boolean;
  wallet: number;
  transactions: TransactionDto[];
}
