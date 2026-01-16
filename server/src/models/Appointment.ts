import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
    sessionId: string;
    ownerName: string;
    petName: string;
    phoneNumber: string;
    preferredDateTime: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
    {
        sessionId: { type: String, required: true, index: true },
        ownerName: { type: String, required: true },
        petName: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        preferredDateTime: { type: Date, required: true },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'cancelled'],
            default: 'pending'
        },
    },
    { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>('Appointment', AppointmentSchema);
