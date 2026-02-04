declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                systemRole: 'system_admin' | 'user';
            };
            requestId?: string;
            workspaceAuth?: {
                workspaceId: string;
                role: 'owner' | 'admin' | 'member' | 'viewer';
            };
        }
    }
}

export { };
