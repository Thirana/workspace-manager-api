import bcrypt from 'bcryptjs';
import mongoose, { type InferSchemaType } from 'mongoose';

import { env } from '../config/env.js';
import { applyToJSON } from './plugins/toJSON.js';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true, // <-- email normalization
            unique: true, // <-- DB-level protection
            index: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 8,
            select: false, // <-- never return password by default
        },

        firstName: { type: String, trim: true, default: null },
        lastName: { type: String, trim: true, default: null },

        // We'll expand roles later (workspace-level RBAC etc.)
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true, // <-- createdAt / updatedAt
    },
);

// Clean JSON output everywhere
applyToJSON(userSchema);

// Hash password only when it changes
userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;

    const saltRounds = env.BCRYPT_SALT_ROUNDS;
    this.password = await bcrypt.hash(this.password, saltRounds);
});

// Instance method: verify password
userSchema.methods.comparePassword = async function comparePassword(
    candidate: string,
): Promise<boolean> {
    // password is select:false, but when we use it in login,
    // we will explicitly select it.
    return bcrypt.compare(candidate, this.password);
};

type User = InferSchemaType<typeof userSchema> & {
    comparePassword(candidate: string): Promise<boolean>;
};

export const UserModel = mongoose.model<User>('User', userSchema);
