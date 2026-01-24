import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

        // Hash of the *actual* refresh token string (never store raw token)
        tokenHash: { type: String, required: true },

        // For rotation tracking
        revokedAt: { type: Date, default: null },
        replacedByTokenId: { type: mongoose.Schema.Types.ObjectId, default: null },

        // Expiry enforcement + cleanup (TTL index defined below)
        expiresAt: { type: Date, required: true },

        // Optional metadata (useful for audit/debug)
        userAgent: { type: String, default: null },
        ip: { type: String, default: null },
    },
    { timestamps: true },
);

// TTL index: MongoDB auto-deletes after expiresAt
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Note: TTL deletion runs in the background and isn’t instant. :contentReference index=5}

export const RefreshTokenModel = mongoose.model('RefreshToken', refreshTokenSchema);
