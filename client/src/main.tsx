import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChatWidget } from './components/ChatWidget';

// For development
ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ChatWidget />
    </React.StrictMode>
);
