import express from 'express';
import { joiValidation } from '../middlewares/validation.middleware';
import { requireOwnership } from '../middlewares/auth.middleware';
import { paymentMethodSchema, updatePaymentMethodSchema } from '../validators/payment-method.validator';
import { PaymentMethodController } from '../controller/payment-method.controller';

const router = express.Router();

// User and admin routes
router.use(requireOwnership);

router.post('/', joiValidation(paymentMethodSchema), PaymentMethodController.addPaymentMethod);
router.get('/', PaymentMethodController.getPaymentMethods);
router.put('/:paymentMethodId', joiValidation(updatePaymentMethodSchema), PaymentMethodController.updatePaymentMethod);
router.delete('/:paymentMethodId', PaymentMethodController.deletePaymentMethod);
router.post('/:paymentMethodId/set-default', PaymentMethodController.setDefaultPaymentMethod);

export default router;
