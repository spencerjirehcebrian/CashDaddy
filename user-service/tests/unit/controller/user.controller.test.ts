// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Request, Response } from 'express';
// import { IUserService } from '@/interfaces/services/user-service.interface';
// import { IAuthService } from '@/interfaces/services/auth-service.interface';
// import { NotFoundError, BadRequestError } from '@/types/error.types';
// import { UserRole, UserStatus } from '@/interfaces/models/user.interface';
// import { UserController } from '@/controller/user.controller';
// import { VerificationStatus } from '@/interfaces';
// import { AuthPayload } from '@/types/auth.types';

// describe('UserController', () => {
//   let userController: UserController;
//   let mockUserService: jest.Mocked<IUserService>;
//   let mockAuthService: jest.Mocked<IAuthService>;
//   let mockRequest: Partial<Request>;
//   let mockResponse: Partial<Response>;
//   let mockNext: jest.Mock;

//   beforeEach(() => {
//     mockUserService = {
//       register: jest.fn(),
//       login: jest.fn(),
//       getUserById: jest.fn(),
//       updateUser: jest.fn(),
//       getAllUsers: jest.fn(),
//       deactivateUser: jest.fn(),
//       reactivateUser: jest.fn(),
//       promoteUserToAdmin: jest.fn()
//     } as any;

//     mockAuthService = {
//       generateToken: jest.fn(),
//       verifyToken: jest.fn()
//     } as any;

//     userController = new UserController(mockUserService, mockAuthService);

//     mockRequest = {
//       user: {
//         userId: 'testUserId',
//         email: 'test@example.com',
//         role: UserRole.USER,
//         status: UserStatus.ACTIVE,
//         verificationStatus: VerificationStatus.APPROVED
//       }
//     };
//     mockResponse = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn()
//     };
//     mockNext = jest.fn();
//   });

//   describe('register', () => {
//     it('should register a new user successfully', async () => {
//       const userData = { email: 'test@example.com', password: 'password', firstName: 'John', lastName: 'Doe' };
//       mockRequest.body = userData;
//       mockUserService.register.mockResolvedValue(userData as any);

//       await userController.register(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.register).toHaveBeenCalledWith(userData.email, userData.password, userData.firstName, userData.lastName);
//       expect(mockResponse.status).toHaveBeenCalledWith(201);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User registered successfully',
//           data: { user: userData }
//         })
//       );
//     });

//     it('should handle registration errors', async () => {
//       const userData = { email: 'test@example.com', password: 'password', firstName: 'John', lastName: 'Doe' };
//       mockRequest.body = userData;
//       mockUserService.register.mockRejectedValue(new Error('Registration failed'));

//       await userController.register(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('login', () => {
//     it('should log in a user successfully', async () => {
//       const loginData = { email: 'test@example.com', password: 'password' };
//       const authPayload: AuthPayload = {
//         userId: 'testUserId',
//         email: 'test@example.com',
//         role: UserRole.USER,
//         status: UserStatus.ACTIVE,
//         verificationStatus: VerificationStatus.APPROVED
//       };
//       mockRequest.body = loginData;
//       mockUserService.login.mockResolvedValue(authPayload);
//       mockAuthService.generateToken.mockReturnValue('token');

//       await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.login).toHaveBeenCalledWith(loginData.email, loginData.password);
//       expect(mockAuthService.generateToken).toHaveBeenCalledWith(authPayload);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'Login successful',
//           data: { token: 'token', user: authPayload }
//         })
//       );
//     });

//     it('should handle login errors', async () => {
//       const loginData = { email: 'test@example.com', password: 'password' };
//       mockRequest.body = loginData;
//       mockUserService.login.mockRejectedValue(new Error('Login failed'));

//       await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('logout', () => {
//     it('should log out a user successfully', async () => {
//       await userController.logout(mockRequest as Request, mockResponse as Response);

//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'Logout successful'
//         })
//       );
//     });
//   });

//   describe('getOwnUser', () => {
//     it('should get the current user profile', async () => {
//       const userData = { id: 'testUserId', email: 'test@example.com', firstName: 'John', lastName: 'Doe' };
//       mockUserService.getUserById.mockResolvedValue(userData as any);

//       await userController.getOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.getUserById).toHaveBeenCalledWith('testUserId');
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User retrieved successfully',
//           data: userData
//         })
//       );
//     });

//     it('should handle errors when getting user profile', async () => {
//       mockUserService.getUserById.mockRejectedValue(new Error('User not found'));

//       await userController.getOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('updateOwnUser', () => {
//     it('should update the current user profile', async () => {
//       const updateData = { firstName: 'Jane', lastName: 'Doe' };
//       mockRequest.body = updateData;
//       const updatedUser = { id: 'testUserId', ...updateData };
//       mockUserService.updateUser.mockResolvedValue(updatedUser as any);

//       await userController.updateOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.updateUser).toHaveBeenCalledWith('testUserId', updateData);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User updated successfully',
//           data: updatedUser
//         })
//       );
//     });

//     it('should handle errors when updating user profile', async () => {
//       mockRequest.body = { firstName: 'Jane' };
//       mockUserService.updateUser.mockRejectedValue(new Error('Update failed'));

//       await userController.updateOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('getAllUsers', () => {
//     it('should get all users', async () => {
//       const users = [
//         { id: '1', email: 'user1@example.com' },
//         { id: '2', email: 'user2@example.com' }
//       ];
//       mockUserService.getAllUsers.mockResolvedValue(users as any);

//       await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.getAllUsers).toHaveBeenCalled();
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'Users retrieved successfully',
//           data: users
//         })
//       );
//     });

//     it('should handle errors when getting all users', async () => {
//       mockUserService.getAllUsers.mockRejectedValue(new Error('Failed to retrieve users'));

//       await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('getUser', () => {
//     it('should get a specific user', async () => {
//       const userId = 'specificUserId';
//       const user = { id: userId, email: 'user@example.com' };
//       mockRequest.params = { userId };
//       mockUserService.getUserById.mockResolvedValue(user as any);

//       await userController.getUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.getUserById).toHaveBeenCalledWith(userId);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User retrieved successfully',
//           data: user
//         })
//       );
//     });

//     it('should handle not found error', async () => {
//       mockRequest.params = { userId: 'nonexistentId' };
//       mockUserService.getUserById.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.getUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(404);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User not found'
//         })
//       );
//     });
//   });

//   describe('updateUser', () => {
//     it('should update a specific user', async () => {
//       const userId = 'specificUserId';
//       const updateData = { firstName: 'Updated', lastName: 'Name' };
//       mockRequest.params = { userId };
//       mockRequest.body = updateData;
//       const updatedUser = { id: userId, ...updateData };
//       mockUserService.updateUser.mockResolvedValue(updatedUser as any);

//       await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.updateUser).toHaveBeenCalledWith(userId, updateData);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User updated successfully',
//           data: updatedUser
//         })
//       );
//     });

//     it('should handle errors when updating a user', async () => {
//       mockRequest.params = { userId: 'someId' };
//       mockRequest.body = { firstName: 'New' };
//       mockUserService.updateUser.mockRejectedValue(new Error('Update failed'));

//       await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//     });
//   });

//   describe('deactivateUser', () => {
//     it('should deactivate a user', async () => {
//       const userId = 'userToDeactivate';
//       mockRequest.params = { userId };
//       const deactivatedUser = { id: userId, status: UserStatus.INACTIVE };
//       mockUserService.deactivateUser.mockResolvedValue(deactivatedUser as any);

//       await userController.deactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.deactivateUser).toHaveBeenCalledWith(userId);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User deactivated successfully',
//           data: { user: deactivatedUser }
//         })
//       );
//     });

//     it('should handle errors when deactivating a user', async () => {
//       mockRequest.params = { userId: 'someId' };
//       mockUserService.deactivateUser.mockRejectedValue(new BadRequestError('User is already inactive'));

//       await userController.deactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User is already inactive'
//         })
//       );
//     });
//   });

//   describe('reactivateUser', () => {
//     it('should reactivate a user', async () => {
//       const userId = 'userToReactivate';
//       mockRequest.params = { userId };
//       const reactivatedUser = { id: userId, status: UserStatus.ACTIVE };
//       mockUserService.reactivateUser.mockResolvedValue(reactivatedUser as any);

//       await userController.reactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.reactivateUser).toHaveBeenCalledWith(userId);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User reactivated successfully',
//           data: { user: reactivatedUser }
//         })
//       );
//     });

//     it('should handle errors when reactivating a user', async () => {
//       mockRequest.params = { userId: 'someId' };
//       mockUserService.reactivateUser.mockRejectedValue(new BadRequestError('User is already active'));

//       await userController.reactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User is already active'
//         })
//       );
//     });
//   });

//   describe('promoteUserToAdmin', () => {
//     it('should promote a user to admin', async () => {
//       const userId = 'userToPromote';
//       mockRequest.params = { userId };
//       const promotedUser = { id: userId, role: UserRole.ADMIN };
//       mockUserService.promoteUserToAdmin.mockResolvedValue(promotedUser as any);

//       await userController.promoteUserToAdmin(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockUserService.promoteUserToAdmin).toHaveBeenCalledWith(userId);
//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User promoted successfully',
//           data: { user: promotedUser }
//         })
//       );
//     });

//     it('should handle errors when promoting a user to admin', async () => {
//       mockRequest.params = { userId: 'someId' };
//       mockUserService.promoteUserToAdmin.mockRejectedValue(new BadRequestError('User is already admin'));

//       await userController.promoteUserToAdmin(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);

//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User is already admin'
//         })
//       );
//     });
//   });

//   describe('register edge cases', () => {
//     it('should handle duplicate email registration', async () => {
//       const userData = { email: 'existing@example.com', password: 'password', firstName: 'John', lastName: 'Doe' };
//       mockRequest.body = userData;
//       mockUserService.register.mockRejectedValue(new BadRequestError('Email already exists'));

//       await userController.register(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Email already exists');
//     });

//     it('should handle invalid input data', async () => {
//       const invalidUserData = { email: 'invalid-email', password: 'short', firstName: '', lastName: '' };
//       mockRequest.body = invalidUserData;
//       mockUserService.register.mockRejectedValue(new BadRequestError('Invalid input data'));

//       await userController.register(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Invalid input data');
//     });
//   });

//   describe('login edge cases', () => {
//     it('should handle non-existent user login attempt', async () => {
//       const loginData = { email: 'nonexistent@example.com', password: 'password' };
//       mockRequest.body = loginData;
//       mockUserService.login.mockRejectedValue(new BadRequestError('Invalid credentials'));

//       await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Invalid credentials');
//     });

//     it('should handle incorrect password', async () => {
//       const loginData = { email: 'user@example.com', password: 'wrongpassword' };
//       mockRequest.body = loginData;
//       mockUserService.login.mockRejectedValue(new BadRequestError('Invalid credentials'));

//       await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Invalid credentials');
//     });

//     it('should handle login attempt for inactive user', async () => {
//       const loginData = { email: 'inactive@example.com', password: 'password' };
//       mockRequest.body = loginData;
//       mockUserService.login.mockRejectedValue(new BadRequestError('Account is inactive'));

//       await userController.login(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Account is inactive');
//     });
//   });

//   describe('getOwnUser edge cases', () => {
//     it('should handle case when user is not found in database', async () => {
//       mockUserService.getUserById.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.getOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
//       expect(mockNext.mock.calls[0][0].message).toBe('User not found');
//     });
//   });

//   describe('updateOwnUser edge cases', () => {
//     it('should handle attempt to update email to an existing email', async () => {
//       const updateData = { email: 'existing@example.com' };
//       mockRequest.body = updateData;
//       mockUserService.updateUser.mockRejectedValue(new BadRequestError('Email already in use'));

//       await userController.updateOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Email already in use');
//     });

//     it('should handle attempt to update to invalid data', async () => {
//       const updateData = { firstName: '' };
//       mockRequest.body = updateData;
//       mockUserService.updateUser.mockRejectedValue(new BadRequestError('Invalid input data'));

//       await userController.updateOwnUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Invalid input data');
//     });
//   });

//   describe('getAllUsers edge cases', () => {
//     it('should return empty array when no users exist', async () => {
//       mockUserService.getAllUsers.mockResolvedValue([]);

//       await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'Users retrieved successfully',
//           data: []
//         })
//       );
//     });

//     it('should handle database error when fetching all users', async () => {
//       mockUserService.getAllUsers.mockRejectedValue(new Error('Database error'));

//       await userController.getAllUsers(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
//       expect(mockNext.mock.calls[0][0].message).toBe('Database error');
//     });
//   });

//   describe('getUser edge cases', () => {
//     it('should handle attempt to get non-existent user', async () => {
//       mockRequest.params = { userId: 'nonexistentId' };
//       mockUserService.getUserById.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.getUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(404);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User not found'
//         })
//       );
//     });

//     it('should handle invalid user ID format', async () => {
//       mockRequest.params = { userId: 'invalidFormat' };
//       mockUserService.getUserById.mockRejectedValue(new BadRequestError('Invalid user ID format'));

//       await userController.getUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(BadRequestError));
//       expect(mockNext.mock.calls[0][0].message).toBe('Invalid user ID format');
//     });
//   });

//   describe('updateUser edge cases', () => {
//     it('should handle attempt to update non-existent user', async () => {
//       mockRequest.params = { userId: 'nonexistentId' };
//       mockRequest.body = { firstName: 'New' };
//       mockUserService.updateUser.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockNext).toHaveBeenCalledWith(expect.any(NotFoundError));
//       expect(mockNext.mock.calls[0][0].message).toBe('User not found');
//     });

//     it('should handle attempt to update with no changes', async () => {
//       mockRequest.params = { userId: 'existingId' };
//       mockRequest.body = {};
//       mockUserService.updateUser.mockResolvedValue({ id: 'existingId', firstName: 'Existing' } as any);

//       await userController.updateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(200);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: true,
//           message: 'User updated successfully',
//           data: expect.objectContaining({ id: 'existingId', firstName: 'Existing' })
//         })
//       );
//     });
//   });

//   describe('deactivateUser edge cases', () => {
//     it('should handle attempt to deactivate non-existent user', async () => {
//       mockRequest.params = { userId: 'nonexistentId' };
//       mockUserService.deactivateUser.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.deactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User not found'
//         })
//       );
//     });

//     it('should handle attempt to deactivate already inactive user', async () => {
//       mockRequest.params = { userId: 'inactiveId' };
//       mockUserService.deactivateUser.mockRejectedValue(new BadRequestError('User is already inactive'));

//       await userController.deactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User is already inactive'
//         })
//       );
//     });
//   });

//   describe('reactivateUser edge cases', () => {
//     it('should handle attempt to reactivate non-existent user', async () => {
//       mockRequest.params = { userId: 'nonexistentId' };
//       mockUserService.reactivateUser.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.reactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User not found'
//         })
//       );
//     });

//     it('should handle attempt to reactivate already active user', async () => {
//       mockRequest.params = { userId: 'activeId' };
//       mockUserService.reactivateUser.mockRejectedValue(new BadRequestError('User is already active'));

//       await userController.reactivateUser(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User is already active'
//         })
//       );
//     });
//   });

//   describe('promoteUserToAdmin edge cases', () => {
//     it('should handle attempt to promote non-existent user', async () => {
//       mockRequest.params = { userId: 'nonexistentId' };
//       mockUserService.promoteUserToAdmin.mockRejectedValue(new NotFoundError('User not found'));

//       await userController.promoteUserToAdmin(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User not found'
//         })
//       );
//     });

//     it('should handle attempt to promote user who is already an admin', async () => {
//       mockRequest.params = { userId: 'adminId' };
//       mockUserService.promoteUserToAdmin.mockRejectedValue(new BadRequestError('User is already an admin'));

//       await userController.promoteUserToAdmin(mockRequest as Request, mockResponse as Response, mockNext);

//       expect(mockResponse.status).toHaveBeenCalledWith(400);
//       expect(mockResponse.json).toHaveBeenCalledWith(
//         expect.objectContaining({
//           success: false,
//           message: 'User is already an admin'
//         })
//       );
//     });
//   });
// });
