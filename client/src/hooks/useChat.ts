import { useState, useCallback, useEffect, useRef } from 'react';
import { Message, ChatConfig } from '../types';
import { createSession, sendMessage as sendMessageApi } from '../services/api';

interface UseChatReturn {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    sendMessage: (content: string) => Promise<void>;
    isInitialized: boolean;
}

export function useChat(config: ChatConfig): UseChatReturn {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const sessionIdRef = useRef<string | null>(null);

    // Initialize session on mount
    useEffect(() => {
        const initSession = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const session = await createSession(config);
                sessionIdRef.current = session.sessionId;

                // Add welcome message
                setMessages([
                    {
                        id: `welcome-${Date.now()}`,
                        role: 'assistant',
                        content: session.welcomeMessage,
                        timestamp: new Date(),
                    },
                ]);
                setIsInitialized(true);
            } catch (err) {
                setError('Failed to connect to the chatbot. Please try again later.');
                console.error('Session init error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        initSession();
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!sessionIdRef.current || !content.trim()) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: content.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);
        setError(null);

        try {
            const response = await sendMessageApi(sessionIdRef.current, content.trim());

            const botMessage: Message = {
                id: `bot-${Date.now()}`,
                role: 'assistant',
                content: response.response,
                timestamp: new Date(response.timestamp),
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (err) {
            setError('Failed to send message. Please try again.');
            console.error('Send message error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        isInitialized,
    };
}
