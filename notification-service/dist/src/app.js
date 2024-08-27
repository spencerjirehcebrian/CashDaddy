import express from 'express';
import { ErrorHandler } from '@cash-daddy/shared';
const createApp = () => {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(ErrorHandler);
    return app;
};
export default createApp;
