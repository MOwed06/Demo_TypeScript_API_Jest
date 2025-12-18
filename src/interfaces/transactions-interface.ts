import * as Enum from "../enumerations";

// corresponds to BigBooks.API.Models.TransactionOverviewDto.cs
export interface TransactionDto {
  transactionKey: number;
  transactionDate: string;
  transactionType: Enum.TransactionType;
  transactionAccount: number;
  purchaseBookKey?: number;
  purchaseQuantity?: number;
}
