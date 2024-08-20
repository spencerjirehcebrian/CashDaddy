import { Response } from 'express';
export interface StandardResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
export declare const sendResponse: <T>(res: Response, statusCode: number, success: boolean, message: string, data?: T) => Response;
//# sourceMappingURL=response.d.ts.map