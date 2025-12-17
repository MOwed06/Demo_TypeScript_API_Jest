import * as Enum from "../enumerations";
import { TransactionDto } from "./transactions-interface";

export interface UserDetailsDto {
  key: number;
  role: Enum.UserRole;
  userEmail: string;
  userName: string;
  isActive: boolean;
  wallet: number;
  transactions: TransactionDto[];
}
