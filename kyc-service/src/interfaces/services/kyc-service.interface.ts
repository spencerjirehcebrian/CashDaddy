import { IKYC } from '../models/kyc.interface.js';

export interface IKYCService {
  submitOrUpdateKYC(
    userId: string,
    kycData: Omit<IKYC, 'user' | 'verificationStatus' | 'addressProofDocument'>,
    addressProofFile: Express.Multer.File
  ): Promise<IKYC>;
  getKYCStatus(userId: string): Promise<IKYC>;
  approveKYC(userId: string): Promise<{ kyc: IKYC }>;
  rejectKYC(userId: string, rejectionReason: string): Promise<IKYC>;
}
