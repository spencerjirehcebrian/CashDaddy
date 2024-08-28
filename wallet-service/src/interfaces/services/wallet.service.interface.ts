import { ITransaction } from '../models/transactions.interface.js';
import { IWallet } from '../models/wallet.interface.js';

export interface IWalletService {
  createWallet(userId: string, initialBalance: number): Promise<IWallet>;
  deposit(userId: string, amount: number, paymentMethodId: string): Promise<{ balance: number; transactionId: string }>;
  getBalance(userId: string): Promise<{ balance: number }>;
  withdraw(userId: string, amount: number): Promise<{ balance: number; payoutId: string }>;
  transfer(fromUserId: string, toUserId: string, amount: number): Promise<{ fromBalance: number; toBalance: number }>;
  getTransactionHistory(userId: string): Promise<ITransaction[]>;
  getTransaction(transactionId: string): Promise<ITransaction>;
}
