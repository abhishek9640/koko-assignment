import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../models/Session.js';
import { generateVetResponse, detectAppointmentIntent, ChatMessage } from '../services/geminiService.js';
import { handleBookingFlow, isBookingInProgress } from '../services/appointmentService.js';

interface SessionConfig {
    userId?: string;
    userName?: string;
    petName?: string;
    source?: string;
}

export const createSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const config: SessionConfig = req.body;
        const sessionId = uuidv4();

        const session = await Session.create({
            sessionId,
            userId: config.userId,
            userName: config.userName,
            petName: config.petName,
            source: config.source,
            messages: [],
            bookingState: {
                inProgress: false,
                step: 'idle',
                collectedData: {},
            },
        });

        // Create welcome message
        const welcomeMessage = config.userName
            ? `Hello ${config.userName}! 🐾 I'm your veterinary assistant. I can help you with pet health questions or book an appointment. How can I assist you today?`
            : "Hello! 🐾 I'm your veterinary assistant. I can help you with pet health questions or book an appointment. How can I assist you today?";

        session.messages.push({
            role: 'assistant',
            content: welcomeMessage,
            timestamp: new Date(),
        });
        await session.save();

        res.status(201).json({
            sessionId: session.sessionId,
            welcomeMessage,
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId, message } = req.body;

        if (!sessionId || !message) {
            res.status(400).json({ error: 'sessionId and message are required' });
            return;
        }

        const session = await Session.findOne({ sessionId });
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        // Add user message to history
        session.messages.push({
            role: 'user',
            content: message,
            timestamp: new Date(),
        });

        let botResponse: string;

        // Check if booking is in progress
        if (isBookingInProgress(session)) {
            const bookingResult = await handleBookingFlow(session, message);
            botResponse = bookingResult.message;
        } else if (detectAppointmentIntent(message)) {
            // Start booking flow
            const bookingResult = await handleBookingFlow(session, message);
            botResponse = bookingResult.message;
        } else {
            // Regular AI response
            const chatHistory: ChatMessage[] = session.messages.slice(0, -1).map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }],
            }));

            botResponse = await generateVetResponse(message, chatHistory);
        }

        // Add bot response to history
        session.messages.push({
            role: 'assistant',
            content: botResponse,
            timestamp: new Date(),
        });
        await session.save();

        res.json({
            response: botResponse,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
};

export const getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionId } = req.params;

        const session = await Session.findOne({ sessionId });
        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        res.json({
            sessionId: session.sessionId,
            messages: session.messages,
            createdAt: session.createdAt,
        });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};
