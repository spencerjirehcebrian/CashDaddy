import mongoose from 'mongoose';
import { IUser, UserRole, UserStatus } from '../../interfaces/models/user.interface.js';
import { User } from '../../models/user.model.js';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator.js';
import { IUserService } from '../../interfaces/services/user-service.interface.js';
import { AuthPayload, BadRequestError, NotFoundError } from '@cash-daddy/shared';

export class UserService implements IUserService {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('User already exists');
    }

    const isFirstUser = !(await User.findOne().select('_id').lean().exec());

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      status: UserStatus.INACTIVE,
      role: isFirstUser ? UserRole.ADMIN : UserRole.USER
    });

    await user.save();
    return user;
  }

  async login(email: string, password: string): Promise<AuthPayload> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError('Account not found');
    }

    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials');
    }

    let effectiveRole = user.role as UserRole;
    if (user.role === UserRole.ADMIN) {
      const isFirstAdmin = !(await User.findOne({
        role: UserRole.ADMIN,
        _id: { $lt: user._id }
      })
        .select('_id')
        .lean()
        .exec());

      if (isFirstAdmin) {
        effectiveRole = UserRole.SUPER_ADMIN;
      }
    }

    const authPayload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: effectiveRole,
      status: (user.status as UserStatus) || undefined
    };

    return authPayload;
  }

  @Cacheable({ keyPrefix: 'user' })
  async getUserById(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findById(userId).populate('userProfile').exec();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  @Cacheable({ keyPrefix: 'all-users' })
  async getAllUsers(): Promise<IUser[]> {
    return User.find({}).populate('userProfile').exec();
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  async deleteUser(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  async deactivateUser(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.INACTIVE) {
      throw new BadRequestError('User is already inactive');
    }

    await user.save();

    return user;
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  async reactivateUser(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestError('User is already active');
    }

    user.status = UserStatus.ACTIVE;
    await user.save();

    return user;
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  async promoteUserToAdmin(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestError('User is already admin');
    }

    user.role = UserRole.ADMIN;
    await user.save();

    return user;
  }
}
