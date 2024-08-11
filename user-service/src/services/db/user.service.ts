import mongoose from 'mongoose';
import { IUser, UserRole, UserStatus } from '../../interfaces/user.interface';
import { User } from '../../models/user.model';
import { BadRequestError, NotFoundError } from '../../types/error.types';
import { AuthPayload } from '../../types/auth.types';
import { Cacheable, CacheInvalidate } from '../../decorators/caching.decorator';
import logger from '../../utils/logger';
import { IKYC, VerificationStatus } from '../../interfaces/kyc.interface';

export class UserService {
  static async register(email: string, password: string, firstName: string, lastName: string): Promise<IUser> {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('User already exists');
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: UserRole.USER
    });

    await user.save();
    return user;
  }

  static async login(email: string, password: string): Promise<AuthPayload> {
    const user = await User.findOne({ email });
    if (!user || user.status === UserStatus.INACTIVE) {
      throw new BadRequestError('Invalid credentials or inactive account');
    }

    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      throw new BadRequestError('Invalid credentials');
    }

    const authPayload: AuthPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      status: (user.status as UserStatus) || undefined,
      verificationStatus: ((user.kyc as IKYC)?.verificationStatus.toString() as VerificationStatus) || VerificationStatus.NOT_SUBMITTED
    };
    logger.info('User logged in', authPayload);

    return authPayload;
  }

  @Cacheable({ keyPrefix: 'user' })
  static async getUserById(userId: string): Promise<IUser> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findById(userId).populate('userProfile').populate('kyc').populate('paymentMethods').exec();
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  static async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  @Cacheable({ keyPrefix: 'all-users' })
  static async getAllUsers(): Promise<IUser[]> {
    return User.find({}).populate('userProfile').populate('kyc').populate('paymentMethods').exec();
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  static async deleteUser(userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new NotFoundError('Invalid user ID');
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  static async deactivateUser(userId: string): Promise<IUser> {
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

    user.status = UserStatus.INACTIVE;
    await user.save();

    return user;
  }

  @CacheInvalidate({ keyPrefix: 'user' })
  static async reactivateUser(userId: string): Promise<IUser> {
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
}
