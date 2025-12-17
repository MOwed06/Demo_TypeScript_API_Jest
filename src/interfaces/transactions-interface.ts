import * as Enum from "../enumerations";

export interface TransactionDto {
  transactionKey: number;
  transactionDate: string;
  transactionType: Enum.TransactionType;
  transactionAccount: number;
  purchaseBookKey?: number;
  purchaseQuantity?: number;
}
