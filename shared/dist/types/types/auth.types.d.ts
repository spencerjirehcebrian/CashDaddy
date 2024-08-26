export interface AuthPayload {
    userId: string;
    email: string;
    role: string;
    status: string;
    verificationStatus: string;
}
export interface SessionData extends AuthPayload {
    createdAt: string;
    [key: string]: string | boolean | number | object | undefined;
}
//# sourceMappingURL=auth.types.d.ts.map