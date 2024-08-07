export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface UserPayload {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
