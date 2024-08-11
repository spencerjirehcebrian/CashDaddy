import { Request, Response, NextFunction } from 'express';
import { PaymentMethodService } from '../services/db/payment-method.service';
import { PaymentMethodType, PaymentProvider } from '../interfaces/payment-method.interface';
import { sendResponse } from '../utils/response';

export class PaymentMethodController {
  static async addPaymentMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { methodType, provider, tokenId, last4 } = req.body;
      const paymentMethod = await PaymentMethodService.addPaymentMethod(
        userId,
        methodType as PaymentMethodType,
        provider as PaymentProvider,
        tokenId,
        last4
      );
      sendResponse(res, 201, true, 'Payment method added successfully', paymentMethod);
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentMethods(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const paymentMethods = await PaymentMethodService.getPaymentMethods(userId);
      sendResponse(res, 200, true, 'Payment methods retrieved successfully', paymentMethods);
    } catch (error) {
      next(error);
    }
  }

  static async updatePaymentMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentMethodId } = req.params;
      const userId = req.user!.userId;
      const updateData = req.body;
      const updatedPaymentMethod = await PaymentMethodService.updatePaymentMethod(paymentMethodId, userId, updateData);
      sendResponse(res, 200, true, 'Payment method updated successfully', updatedPaymentMethod);
    } catch (error) {
      next(error);
    }
  }

  static async deletePaymentMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentMethodId } = req.params;
      const userId = req.user!.userId;
      await PaymentMethodService.deletePaymentMethod(paymentMethodId, userId);
      sendResponse(res, 200, true, 'Payment method deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  static async setDefaultPaymentMethod(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { paymentMethodId } = req.params;
      const userId = req.user!.userId;
      const updatedPaymentMethod = await PaymentMethodService.setDefaultPaymentMethod(paymentMethodId, userId);
      sendResponse(res, 200, true, 'Default payment method set successfully', updatedPaymentMethod);
    } catch (error) {
      next(error);
    }
  }
}
