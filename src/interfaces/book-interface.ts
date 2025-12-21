// corresponds to BigBooks.API.Models.BookAddUpdateDto.cs

import { Genre } from '../enumerations';

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

// corresponds to BigBooks.API.Models.BookOverviewDto.cs
export interface BookOverviewDto {
  key: number;
  title: string;
  author: string;
  genre: string;
  rating?: number;
  reviews: number;
}
