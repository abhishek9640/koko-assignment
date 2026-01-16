import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ISession extends Document {
    sessionId: string;
    userId?: string;
    userName?: string;
    petName?: string;
    source?: string;
    messages: IMessage[];
    bookingState?: {
        inProgress: boolean;
        step: 'idle' | 'ownerName' | 'petName' | 'phone' | 'dateTime' | 'confirm';
        collectedData: {
            ownerName?: string;
            petName?: string;
            phoneNumber?: string;
            preferredDateTime?: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
});

const SessionSchema = new Schema<ISession>(
    {
        sessionId: { type: String, required: true, unique: true, index: true },
        userId: { type: String },
        userName: { type: String },
        petName: { type: String },
        source: { type: String },
        messages: [MessageSchema],
        bookingState: {
            inProgress: { type: Boolean, default: false },
            step: {
                type: String,
                enum: ['idle', 'ownerName', 'petName', 'phone', 'dateTime', 'confirm'],
                default: 'idle'
            },
            collectedData: {
                ownerName: String,
                petName: String,
                phoneNumber: String,
                preferredDateTime: String,
            },
        },
    },
    { timestamps: true }
);

export const Session = mongoose.model<ISession>('Session', SessionSchema);
