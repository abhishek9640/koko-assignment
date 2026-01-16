import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Message } from './Message';
import { DateTimePicker } from './DateTimePicker';
import { useChat } from '../hooks/useChat';
import { ChatConfig } from '../types';

interface ChatWindowProps {
    config: ChatConfig;
    onClose: () => void;
}

const CloseIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const PawIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6-4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
);

const BotAvatarIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
    </svg>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({ config, onClose }) => {
    const [inputValue, setInputValue] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const { messages, isLoading, error, sendMessage, isInitialized } = useChat(config);

    // Detect if the last bot message is asking for date/time
    const isAskingForDateTime = useMemo(() => {
        if (messages.length === 0) return false;
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'assistant') return false;
        // Check if message contains the date/time prompt
        return lastMessage.content.includes('When would you prefer to schedule') ||
            lastMessage.content.includes("provide date and time") ||
            lastMessage.content.includes("couldn't understand that date/time");
    }, [messages]);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Focus input on mount
    useEffect(() => {
        if (isInitialized) {
            inputRef.current?.focus();
        }
    }, [isInitialized]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        const message = inputValue;
        setInputValue('');
        await sendMessage(message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleDateTimeSelect = async (dateTime: string) => {
        setShowDatePicker(false);
        await sendMessage(dateTime);
    };

    const handleDateTimeCancel = () => {
        setShowDatePicker(false);
    };

    return (
        <div className="vet-chat-window">
            {/* Header */}
            <div className="vet-chat-header">
                <div className="vet-header-icon">
                    <PawIcon />
                </div>
                <div className="vet-header-info">
                    <h3 className="vet-header-title">Vet Assistant</h3>
                    <p className="vet-header-subtitle">Pet health & appointments</p>
                </div>
                <button className="vet-close-btn" onClick={onClose} aria-label="Close chat">
                    <CloseIcon />
                </button>
            </div>

            {/* Messages */}
            <div className="vet-messages-container">
                {messages.map((message) => (
                    <Message key={message.id} message={message} />
                ))}

                {isLoading && (
                    <div className="vet-typing-indicator">
                        <div className="vet-message-avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            <BotAvatarIcon />
                        </div>
                        <div className="vet-typing-dots">
                            <span className="vet-typing-dot" />
                            <span className="vet-typing-dot" />
                            <span className="vet-typing-dot" />
                        </div>
                    </div>
                )}

                {error && (
                    <div className="vet-error-message">
                        {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="vet-input-container">
                {/* Date Time Picker */}
                {(isAskingForDateTime || showDatePicker) && !isLoading && (
                    <DateTimePicker
                        onSelect={handleDateTimeSelect}
                        onCancel={handleDateTimeCancel}
                    />
                )}

                <form onSubmit={handleSubmit}>
                    <div className="vet-input-wrapper">
                        <input
                            ref={inputRef}
                            type="text"
                            className="vet-input"
                            placeholder="Ask about pet health or book an appointment..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={!isInitialized || isLoading}
                        />
                        <button
                            type="submit"
                            className="vet-send-btn"
                            disabled={!inputValue.trim() || isLoading || !isInitialized}
                            aria-label="Send message"
                        >
                            <SendIcon />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
