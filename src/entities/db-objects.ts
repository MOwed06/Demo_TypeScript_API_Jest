import { UserRole, Genre } from "../enumerations";

// corresponds to BigBooks.API.Entities.AppUser.cs
export class AppUser {
  key: number;
  role: UserRole;
  userEmail: string;
  userName: string;
  password: string;
  isActive: boolean;
  wallet: number;

  // translate from db record to entity
  constructor(data: any) {
    this.key = data.Key;
    this.role = data.Role as UserRole;
    this.userEmail = data.UserEmail;
    this.userName = data.UserName;
    this.password = data.Password;
    this.isActive = data.IsActive;
    this.wallet = data.Wallet;
  }
}

// corresponds to BigBooks.API.Entities.Book.cs
export class Book {
  key: number;
  title: string;
  author: string;
  description: string;
  genre: Genre;
  price: number;
  stockQuantity: number;
  isbn: string;

  // translate from db record to entity
  constructor(data: any) {
    this.key = data.Key;
    this.title = data.Title;
    this.author = data.Author;
    this.description = data.Description;
    this.genre = data.Genre as Genre;
    this.price = data.Price;
    this.stockQuantity = data.StockQuantity;
    this.isbn = data.Isbn;
  }
}
