export interface AuthRequest {
  userId: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiration?: Date;
  error: string;
}
