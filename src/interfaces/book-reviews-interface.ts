// corresponds to BigBooks.API.Models.BookReviewAddDto.cs
export interface BookReviewAddDto {
  score: number;
  isAnonymous: boolean;
  description: string;
}

// corresponds to BigBooks.API.Models.BookReviewDto.cs
export interface BookReviewDto {
  reviewKey: number;
  bookTitle: string;
  score: number;
  reviewDate: string;
  user: string;
  description: string;
}
