import { IAuthService } from '@/interfaces/services/auth-service.interface';
import { User } from '@/models/user.model';
import { UserRole, UserStatus } from '@/interfaces/models/user.interface';
import { BadRequestError, NotFoundError } from '@/types/error.types';
import bcrypt from 'bcryptjs';
import { UserService } from '@/services/db/user.service';

jest.mock('@/models/user.model');
jest.mock('bcryptjs');

describe('UserService', () => {
  let userService: UserService;
  let mockAuthService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn()
    };
    userService = new UserService(mockAuthService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.create as jest.Mock).mockResolvedValue({
        ...userData,
        password: hashedPassword,
        _id: 'someUserId'
      });

      const result = await userService.register(userData.email, userData.password, userData.firstName, userData.lastName);

      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(User.create).toHaveBeenCalledWith({
        ...userData,
        password: hashedPassword
      });
      expect(result).toEqual({
        ...userData,
        password: hashedPassword,
        _id: 'someUserId'
      });
    });

    it('should throw BadRequestError if user already exists', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };
      (User.findOne as jest.Mock).mockResolvedValue({ email: userData.email });

      await expect(userService.register(userData.email, userData.password, userData.firstName, userData.lastName)).rejects.toThrow(
        BadRequestError
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      const user = {
        _id: 'userId',
        email: loginData.email,
        password: 'hashedPassword',
        role: UserRole.USER,
        status: UserStatus.ACTIVE
      };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await userService.login(loginData.email, loginData.password);

      expect(User.findOne).toHaveBeenCalledWith({ email: loginData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, user.password);
      expect(result).toEqual({
        userId: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      });
    });

    it('should throw BadRequestError if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(userService.login('nonexistent@example.com', 'password123')).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if password is incorrect', async () => {
      const user = {
        email: 'test@example.com',
        password: 'hashedPassword'
      };
      (User.findOne as jest.Mock).mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(userService.login('test@example.com', 'wrongpassword')).rejects.toThrow(BadRequestError);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const userId = 'someUserId';
      const user = {
        _id: userId,
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe'
      };
      (User.findById as jest.Mock).mockResolvedValue(user);

      const result = await userService.getUserById(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      await expect(userService.getUserById('nonexistentId')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const userId = 'someUserId';
      const updateData = {
        firstName: 'Jane',
        lastName: 'Doe'
      };
      const updatedUser = {
        _id: userId,
        email: 'test@example.com',
        ...updateData
      };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedUser);

      const result = await userService.updateUser(userId, updateData);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, updateData, { new: true });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(userService.updateUser('nonexistentId', { firstName: 'New' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [
        { _id: 'user1', email: 'user1@example.com' },
        { _id: 'user2', email: 'user2@example.com' }
      ];
      (User.find as jest.Mock).mockResolvedValue(users);

      const result = await userService.getAllUsers();

      expect(User.find).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      const userId = 'someUserId';
      const deactivatedUser = {
        _id: userId,
        email: 'test@example.com',
        status: UserStatus.INACTIVE
      };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(deactivatedUser);

      const result = await userService.deactivateUser(userId);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { status: UserStatus.INACTIVE }, { new: true });
      expect(result).toEqual(deactivatedUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(userService.deactivateUser('nonexistentId')).rejects.toThrow(NotFoundError);
    });
  });

  describe('reactivateUser', () => {
    it('should reactivate user successfully', async () => {
      const userId = 'someUserId';
      const reactivatedUser = {
        _id: userId,
        email: 'test@example.com',
        status: UserStatus.ACTIVE
      };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(reactivatedUser);

      const result = await userService.reactivateUser(userId);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { status: UserStatus.ACTIVE }, { new: true });
      expect(result).toEqual(reactivatedUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(userService.reactivateUser('nonexistentId')).rejects.toThrow(NotFoundError);
    });
  });

  describe('promoteUserToAdmin', () => {
    it('should promote user to admin successfully', async () => {
      const userId = 'someUserId';
      const promotedUser = {
        _id: userId,
        email: 'test@example.com',
        role: UserRole.ADMIN
      };
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(promotedUser);

      const result = await userService.promoteUserToAdmin(userId);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(userId, { role: UserRole.ADMIN }, { new: true });
      expect(result).toEqual(promotedUser);
    });

    it('should throw NotFoundError if user not found', async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      await expect(userService.promoteUserToAdmin('nonexistentId')).rejects.toThrow(NotFoundError);
    });
  });
});
