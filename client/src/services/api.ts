import { ChatConfig, SessionResponse, MessageResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function createSession(config: ChatConfig): Promise<SessionResponse> {
    const response = await fetch(`${API_URL}/chat/session`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
    });

    if (!response.ok) {
        throw new Error('Failed to create session');
    }

    return response.json();
}

export async function sendMessage(sessionId: string, message: string): Promise<MessageResponse> {
    const response = await fetch(`${API_URL}/chat/message`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, message }),
    });

    if (!response.ok) {
        throw new Error('Failed to send message');
    }

    return response.json();
}
