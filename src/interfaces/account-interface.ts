import * as Enum from '../enumerations';
import { TransactionDto } from './transactions-interface';

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

// corresponds to BigBooks.API.Models.UserAddUpdateDto.cs
export interface UserAddUpdateDto {
  userEmail: string;
  userName: string;
  password: string;
  role: Enum.UserRole;
  isActive: boolean;
  wallet: number;
}

// corresponds to JsonPatchDocument applied to UserAddUpdateDto.cs
export interface UserJsonPatchOperation {
  op: 'replace'; // Only 'replace' operation is supported by BigBooks api
  path: string;
  value?: string | number | boolean | null;
}
