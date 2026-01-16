import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 5000,
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vet-chatbot',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
