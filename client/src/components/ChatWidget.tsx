import React, { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { ChatConfig } from '../types';
import '../styles/chatbot.css';

interface ChatWidgetProps {
    config?: ChatConfig;
}

const ChatIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="12" cy="10" r="1" fill="currentColor" />
        <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
);

export const ChatWidget: React.FC<ChatWidgetProps> = ({ config = {} }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="vet-chatbot-widget">
            {isOpen && (
                <ChatWindow config={config} onClose={() => setIsOpen(false)} />
            )}

            <button
                className="vet-toggle-btn"
                onClick={toggleChat}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                <ChatIcon />
            </button>
        </div>
    );
};
