import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment.js';

export const getAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;

        const appointments = await Appointment.find({ sessionId }).sort({ createdAt: -1 });

        res.json({ appointments });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};

export const getAllAppointments = async (req: Request, res: Response): Promise<void> => {
    try {
        const { status, page = 1, limit = 10 } = req.query;

        const query: Record<string, unknown> = {};
        if (status) {
            query.status = status;
        }

        const appointments = await Appointment.find(query)
            .sort({ createdAt: -1 })
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Appointment.countDocuments(query);

        res.json({
            appointments,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        const appointment = await Appointment.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!appointment) {
            res.status(404).json({ error: 'Appointment not found' });
            return;
        }

        res.json({ appointment });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
};
