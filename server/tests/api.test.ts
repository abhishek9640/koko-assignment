import request from 'supertest';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import chatRoutes from '../src/routes/chatRoutes.js';
import appointmentRoutes from '../src/routes/appointmentRoutes.js';

// Create a test app
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/chat', chatRoutes);
app.use('/api/appointments', appointmentRoutes);

describe('Vet Chatbot API', () => {
    beforeAll(async () => {
        // Connect to test database
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vet-chatbot-test';
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('POST /api/chat/session', () => {
        it('should create a new chat session', async () => {
            const response = await request(app)
                .post('/api/chat/session')
                .send({
                    userName: 'Test User',
                    petName: 'Buddy'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('sessionId');
            expect(response.body).toHaveProperty('welcomeMessage');
            expect(response.body.welcomeMessage).toContain('Test User');
        });

        it('should create session without user info', async () => {
            const response = await request(app)
                .post('/api/chat/session')
                .send({});

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('sessionId');
            expect(response.body.welcomeMessage).toContain('Hello!');
        });
    });

    describe('POST /api/chat/message', () => {
        let sessionId: string;

        beforeEach(async () => {
            const sessionResponse = await request(app)
                .post('/api/chat/session')
                .send({});
            sessionId = sessionResponse.body.sessionId;
        });

        it('should return error for missing sessionId', async () => {
            const response = await request(app)
                .post('/api/chat/message')
                .send({ message: 'Hello' });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('sessionId');
        });

        it('should return error for missing message', async () => {
            const response = await request(app)
                .post('/api/chat/message')
                .send({ sessionId });

            expect(response.status).toBe(400);
            expect(response.body.error).toContain('message');
        });

        it('should detect appointment booking intent', async () => {
            const response = await request(app)
                .post('/api/chat/message')
                .send({
                    sessionId,
                    message: 'I want to book an appointment'
                });

            expect(response.status).toBe(200);
            expect(response.body.response).toContain('pet owner');
        });
    });

    describe('GET /api/chat/history/:sessionId', () => {
        it('should return 404 for non-existent session', async () => {
            const response = await request(app)
                .get('/api/chat/history/non-existent-id');

            expect(response.status).toBe(404);
        });

        it('should return session history', async () => {
            // Create session first
            const sessionResponse = await request(app)
                .post('/api/chat/session')
                .send({ userName: 'Test' });
            const sessionId = sessionResponse.body.sessionId;

            const response = await request(app)
                .get(`/api/chat/history/${sessionId}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('messages');
            expect(response.body.messages).toBeInstanceOf(Array);
        });
    });

    describe('GET /api/appointments', () => {
        it('should return appointments list', async () => {
            const response = await request(app)
                .get('/api/appointments');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('appointments');
            expect(response.body).toHaveProperty('pagination');
        });

        it('should filter by status', async () => {
            const response = await request(app)
                .get('/api/appointments?status=pending');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('appointments');
        });
    });
});
