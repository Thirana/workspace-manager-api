import type { Schema } from 'mongoose';

// cspell:ignore virtuals

export function applyToJSON(schema: Schema) {
    schema.set('toJSON', {
        virtuals: true,
        versionKey: false, // removes __v
        transform: (_doc, ret) => {
            // normalize id
            ret.id = ret._id;
            delete ret._id;

            // safety: never expose password even if it was selected manually
            delete ret.password;

            return ret;
        },
    });
}
