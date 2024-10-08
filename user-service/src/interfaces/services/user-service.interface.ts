import { AuthPayload } from '@cash-daddy/shared';
import { IUser } from '../models/user.interface.js';

export interface IUserService {
  register(email: string, password: string, firstName: string, lastName: string): Promise<IUser>;
  login(email: string, password: string): Promise<AuthPayload>;
  getUserById(userId: string): Promise<IUser>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser>;
  getAllUsers(): Promise<IUser[]>;
  deleteUser(userId: string): Promise<void>;
  deactivateUser(userId: string): Promise<IUser>;
  reactivateUser(userId: string): Promise<IUser>;
  promoteUserToAdmin(userId: string): Promise<IUser>;
}
