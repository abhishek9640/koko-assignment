import React from 'react';
import { Message as MessageType } from '../types';

interface MessageProps {
    message: MessageType;
}

const UserIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const BotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M4.5 12.5 3 14" />
        <path d="M19.5 12.5 21 14" />
    </svg>
);

export const Message: React.FC<MessageProps> = ({ message }) => {
    const isUser = message.role === 'user';
    const timeString = new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Process markdown-like formatting
    const formatContent = (content: string) => {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br />');
    };

    return (
        <div className={`vet-message ${isUser ? 'vet-message-user' : 'vet-message-bot'}`}>
            <div className="vet-message-avatar">
                {isUser ? <UserIcon /> : <BotIcon />}
            </div>
            <div className="vet-message-content">
                <div
                    className="vet-message-bubble"
                    dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
                />
                <span className="vet-message-time">{timeString}</span>
            </div>
        </div>
    );
};
