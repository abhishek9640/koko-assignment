export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatConfig {
    userId?: string;
    userName?: string;
    petName?: string;
    source?: string;
}

export interface SessionResponse {
    sessionId: string;
    welcomeMessage: string;
}

export interface MessageResponse {
    response: string;
    timestamp: string;
}
