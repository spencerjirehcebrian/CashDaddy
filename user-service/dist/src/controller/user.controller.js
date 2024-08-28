import { User } from '../models/user.model.js';
import { Types } from 'mongoose';
import { BadRequestError, CustomLogger, NotFoundError, sendResponse, VerificationStatus } from '@cash-daddy/shared';
import { config } from '../config/index.js';
import { UserStatus } from '../interfaces/index.js';
export class UserController {
    constructor(userService, authService, redisService, kafkaProducer) {
        this.userService = userService;
        this.authService = authService;
        this.redisService = redisService;
        this.kafkaProducer = kafkaProducer;
        this.kafkaDataPromiseResolve = null;
    }
    async register(req, res, next) {
        try {
            const { email, password, firstName, lastName } = req.body;
            const user = await this.userService.register(email, password, firstName, lastName);
            this.kafkaProducer.send({
                topic: 'notification-events',
                messages: [
                    {
                        value: JSON.stringify({
                            action: 'triggerNotificationEmailVerification',
                            payload: {
                                userId: user._id.toString(),
                                verificationLink: `${config.APP_URL_USER}/api/users/me/verify/${user._id.toString()}`
                            }
                        })
                    }
                ]
            });
            sendResponse(res, 201, true, 'User registered successfully', { user });
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const authPayload = await this.userService.login(email, password);
            const { userId, email: userEmail, role, status } = authPayload;
            const user = await User.findById(userId);
            if (!user || user.status === UserStatus.INACTIVE) {
                throw new NotFoundError('User not found or requires verification via email');
            }
            if (user?.kyc) {
                await this.kafkaProducer.send({
                    topic: 'kyc-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'getOwnKYC',
                                payload: {
                                    userId: authPayload.userId
                                }
                            })
                        }
                    ]
                });
                const kafkaDataCheck = await new Promise((resolve) => {
                    this.kafkaDataPromiseResolve = resolve;
                    setTimeout(() => {
                        if (this.kafkaDataPromiseResolve) {
                            this.kafkaDataPromiseResolve(null);
                            this.kafkaDataPromiseResolve = null;
                        }
                    }, 10000);
                });
                if (!kafkaDataCheck) {
                    next(new Error('KYC not found'));
                }
                const newAuthPayload = {
                    userId,
                    email: userEmail,
                    role,
                    status,
                    verificationStatus: kafkaDataCheck?.verificationStatus
                };
                const token = this.authService.generateToken(newAuthPayload);
                this.kafkaProducer.send({
                    topic: 'notification-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'triggerNotificationLogin',
                                payload: {
                                    userId: user._id.toString()
                                }
                            })
                        }
                    ]
                });
                sendResponse(res, 200, true, 'Login successful', { token, user: newAuthPayload });
            }
            else {
                const newAuthPayload = {
                    userId,
                    email: userEmail,
                    role,
                    status,
                    verificationStatus: VerificationStatus.NOT_SUBMITTED
                };
                const token = this.authService.generateToken(newAuthPayload);
                this.kafkaProducer.send({
                    topic: 'notification-events',
                    messages: [
                        {
                            value: JSON.stringify({
                                action: 'triggerNotificationLogin',
                                payload: {
                                    userId
                                }
                            })
                        }
                    ]
                });
                sendResponse(res, 200, true, 'Login successful', { token, user: newAuthPayload });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async logout(req, res, next) {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (token) {
                await this.redisService.addToBlacklist(token);
            }
            sendResponse(res, 200, true, 'Logout successful');
        }
        catch (error) {
            next(error);
        }
    }
    async getOwnUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await this.userService.getUserById(userId);
            sendResponse(res, 200, true, 'User retrieved successfully', user);
        }
        catch (error) {
            next(error);
        }
    }
    async updateOwnUser(req, res, next) {
        try {
            const userId = req.user.userId;
            const updateData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateData);
            sendResponse(res, 200, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    async getAllUsers(_req, res, next) {
        try {
            const users = await this.userService.getAllUsers();
            sendResponse(res, 200, true, 'Users retrieved successfully', users);
        }
        catch (error) {
            next(error);
        }
    }
    async getUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await this.userService.getUserById(userId);
            sendResponse(res, 200, true, 'User retrieved successfully', user);
        }
        catch (error) {
            if (error instanceof NotFoundError) {
                sendResponse(res, 404, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async updateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const updateData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateData);
            sendResponse(res, 200, true, 'User updated successfully', updatedUser);
        }
        catch (error) {
            next(error);
        }
    }
    async deactivateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const deactivatedUser = await this.userService.deactivateUser(userId);
            sendResponse(res, 200, true, 'User deactivated successfully', { user: deactivatedUser });
        }
        catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                sendResponse(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async reactivateUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const reactivatedUser = await this.userService.reactivateUser(userId);
            sendResponse(res, 200, true, 'User reactivated successfully', { user: reactivatedUser });
        }
        catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                sendResponse(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async verifyUser(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await this.userService.reactivateUser(userId);
            sendResponse(res, 200, true, 'User verified successfully', { user });
        }
        catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                sendResponse(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    async promoteUserToAdmin(req, res, next) {
        try {
            const userId = req.params.userId;
            const promotedUser = await this.userService.promoteUserToAdmin(userId);
            sendResponse(res, 200, true, 'User promoted successfully', { user: promotedUser });
        }
        catch (error) {
            if (error instanceof NotFoundError || error instanceof BadRequestError) {
                sendResponse(res, 400, false, error.message);
            }
            else {
                next(error);
            }
        }
    }
    // Kakfa Actions
    async handleGetUser(userId) {
        CustomLogger.info('Handling getUser event for user:', userId);
        const user = await User.findById(userId).populate('userProfile').exec();
        if (!user) {
            throw new NotFoundError('User not found');
        }
        await this.kafkaProducer.send({
            topic: 'kyc-events',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'returnUser',
                        payload: user
                    })
                }
            ]
        });
    }
    async handleGetUserWallet(userId) {
        CustomLogger.info('Handling getUserWallet event for user:', userId);
        const user = await User.findById(userId).populate('userProfile').exec();
        if (!user) {
            throw new NotFoundError('User not found');
        }
        await this.kafkaProducer.send({
            topic: 'wallet-events',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'returnData',
                        payload: user
                    })
                }
            ]
        });
    }
    async handleGetUserNotification(userId) {
        CustomLogger.info('Handling getUserNotification event for user:', userId);
        const user = await User.findById(userId).populate('userProfile').exec();
        if (!user) {
            throw new NotFoundError('User not found');
        }
        await this.kafkaProducer.send({
            topic: 'user-fetch-topic',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'returnUser',
                        payload: user
                    })
                }
            ]
        });
        CustomLogger.info('User sent successfully:', user);
    }
    async handleUpdateUserKYC(userId, kycId) {
        CustomLogger.info('Handling updateUserKYC event for user:', userId);
        const updatedUser = await this.userService.updateUser(userId, { kyc: new Types.ObjectId(kycId) });
        if (!updatedUser.kyc) {
            throw new NotFoundError('KYC not found');
        }
        await this.kafkaProducer.send({
            topic: 'kyc-events',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'returnUser',
                        payload: updatedUser
                    })
                }
            ]
        });
    }
    async handleUpdateUserStripeCustomer(userId, stripeCustomerId) {
        CustomLogger.info('Handling updateUserStripeCustomer event for user:', userId);
        const updatedUser = await this.userService.updateUser(userId, { stripeCustomerId });
        if (!updatedUser.stripeCustomerId) {
            throw new NotFoundError('Stripe customer not updated');
        }
        const user = await User.findById(userId).populate('userProfile').exec();
        CustomLogger.info('Stripe customer updated for user:', user?.stripeCustomerId);
        await this.kafkaProducer.send({
            topic: 'wallet-events',
            messages: [
                {
                    value: JSON.stringify({
                        action: 'returnData',
                        payload: user
                    })
                }
            ]
        });
    }
    handleReturnKafkaData(kafkaData) {
        if (this.kafkaDataPromiseResolve) {
            this.kafkaDataPromiseResolve(kafkaData);
            this.kafkaDataPromiseResolve = null;
        }
        else {
            CustomLogger.warn('Received data from Kafka but no promise was found');
        }
    }
}
