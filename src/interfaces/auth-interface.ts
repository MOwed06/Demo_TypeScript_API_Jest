// corresponds to BigBooks.API.Authentication.AuthRequest.cs
export interface AuthRequest {
  userId: string;
  password: string;
}

// corresponds to BigBooks.API.Authentication.AuthResponse.cs
export interface AuthResponse {
  token: string;
  expiration?: Date;
  error: string;
}
