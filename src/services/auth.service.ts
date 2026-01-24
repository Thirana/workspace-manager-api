import { AppError } from "../utils/AppError";
import type { RegisterInput } from "../schemas/auth.schema";
import { UserModel } from "../models/user.model";

function isDuplicateKeyError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && (err as any).code === 11000;
}

export class AuthService {

    static async register(input: RegisterInput) {
        try {
            const user = await UserModel.create(
                {
                    email: input.email,
                    password: input.password,
                    firstName: input.firstName ?? null,
                    lastName: input.lastName ?? null
                })
            return user // safe because toJSON transform removes password

        } catch (err) {
            if (isDuplicateKeyError(err)) {
                throw new AppError('Email already registered', 409);
            }
            throw err;
        }
    }
}