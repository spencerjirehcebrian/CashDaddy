import { IKYC } from '../models/kyc.interface';
import { IUser } from '../models/user.interface';

export interface IKYCService {
  submitOrUpdateKYC(userId: string, kycData: Omit<IKYC, 'user' | 'verificationStatus'>): Promise<IKYC>;
  getKYCStatus(userId: string): Promise<IKYC>;
  approveKYC(userId: string): Promise<{ kyc: IKYC; user: IUser }>;
  rejectKYC(userId: string, rejectionReason: string): Promise<IKYC>;
}
