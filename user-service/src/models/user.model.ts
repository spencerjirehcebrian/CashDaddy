import mongoose, { Model, Schema } from 'mongoose';
import { IUser, UserRole, UserStatus } from '../interfaces/models/user.interface';
import bcryptjs from 'bcryptjs';

interface IUserMethods {
  isValidPassword(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), default: UserRole.USER },
    status: { type: String, enum: Object.values(UserStatus), default: UserStatus.ACTIVE },
    userProfile: { type: Schema.Types.ObjectId, ref: 'UserProfile' },
    kyc: { type: Schema.Types.ObjectId, ref: 'KnowYourCustomer' }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    },
    toObject: {
      transform: function (_doc, ret) {
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isValidPassword = async function (password: string): Promise<boolean> {
  return await bcryptjs.compare(password, this.password);
};

export const User = mongoose.model<IUser, UserModel>('User', userSchema);
