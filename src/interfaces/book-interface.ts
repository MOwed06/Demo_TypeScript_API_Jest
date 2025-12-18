// corresponds to BigBooks.API.Models.BookAddUpdateDto.cs

import { Genre } from "src/enumerations";

export interface BookAddUpdateDto {
  title: string;
  author: string;
  isbn: string;
  description: string;
  genre: Genre;
  price: number;
  stockQuantity: number;
}

// corresponds to BigBooks.API.Models.BookDetailsDto.cs
export interface BookDetailsDto {
  key: number;
  title: string;
  author: string;
  isbn: string;
  description: string;
  genre: Genre;
  price: number;
  inStock: number;
  rating?: number;
  reviews: number;
}
