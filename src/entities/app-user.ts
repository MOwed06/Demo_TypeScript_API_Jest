import { UserRole } from "../enumerations";

export class AppUser {
  key: number;
  role: UserRole;
  userEmail: string;
  userName: string;
  password: string;
  isActive: boolean;
  wallet: number;

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
