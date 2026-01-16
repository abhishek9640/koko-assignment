import { Router } from 'express';
import { createSession, sendMessage, getHistory } from '../controllers/chatController.js';

const router = Router();

// Create new chat session
router.post('/session', createSession);

// Send message and get AI response
router.post('/message', sendMessage);

// Get conversation history
router.get('/history/:sessionId', getHistory);

export default router;
