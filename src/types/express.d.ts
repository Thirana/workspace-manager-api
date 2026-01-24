declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                systemRole: 'system_admin' | 'user';
            };
        }
    }
}

export { };
