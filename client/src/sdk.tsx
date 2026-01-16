import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';
import { ChatConfig } from './types';

// Declare global config type
declare global {
    interface Window {
        VetChatbotConfig?: ChatConfig;
    }
}

// Self-executing function to initialize the chatbot
(function () {
    // Wait for DOM to be ready
    const init = () => {
        // Get config from window object (if provided)
        const config: ChatConfig = window.VetChatbotConfig || {};

        // Create container element
        const container = document.createElement('div');
        container.id = 'vet-chatbot-root';
        document.body.appendChild(container);

        // Render the chatbot widget
        const root = ReactDOM.createRoot(container);
        root.render(
            <React.StrictMode>
                <ChatWidget config={config} />
            </React.StrictMode>
        );
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
