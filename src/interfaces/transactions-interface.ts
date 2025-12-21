import * as Enum from '../enumerations';

// corresponds to BigBooks.API.Models.TransactionOverviewDto.cs
export interface TransactionDto {
  transactionKey: number;
  transactionDate: string;
  transactionType: Enum.TransactionType;
  transactionAmount: number;
  purchaseBookKey?: number;
  purchaseQuantity?: number;
}

// corresponds to BigBooks.API.Models.PurchaseRequestDto.cs
export interface PurchaseRequestDto {
  bookKey: number;
  requestedQuantity: number;
  transactionConfirmation: string;
}
