# Veterinary Chatbot SDK

A website-integrable chatbot SDK that answers generic veterinary-related questions and books veterinary appointments. Built with the MERN stack and Google Gemini AI.

![Demo](https://img.shields.io/badge/Demo-Ready-green) ![Node.js](https://img.shields.io/badge/Node.js-18+-blue) ![React](https://img.shields.io/badge/React-18-blue) ![MongoDB](https://img.shields.io/badge/MongoDB-6+-green)

## 🎯 Features

- **Plug-and-Play SDK**: Embed the chatbot on any website with a single script tag
- **AI-Powered Q&A**: Uses Google Gemini API to answer veterinary questions
- **Appointment Booking**: Conversational flow to book vet appointments
- **Context Support**: Pass user/pet information via configuration object
- **Modern UI**: Beautiful dark-themed floating widget with animations
- **Persistent Storage**: Conversations and appointments stored in MongoDB

## 🏗️ Architecture

```
Assignment-koko/
├── server/                 # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/        # Database & environment config
│   │   ├── models/        # MongoDB schemas (Session, Appointment)
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── services/      # AI & booking logic
│   │   └── middleware/    # Error handling
│   └── package.json
│
├── client/                 # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom hooks (useChat)
│   │   ├── services/      # API client
│   │   ├── styles/        # CSS styles
│   │   └── sdk.tsx        # SDK entry point
│   └── package.json
│   └── demo              # Demo integration page
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Clone and Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

**Server** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/vet-chatbot
GEMINI_API_KEY=your-gemini-api-key-here
CLIENT_URL=http://localhost:5173
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

### 4. Build SDK for Production

```bash
cd client
npm run build:sdk

# Output: client/dist-sdk/chatbot.js
```

## 📦 SDK Integration

### Basic Integration

Add the script tag to any website:

```html
<script src="https://your-domain.com/chatbot.js"></script>
```

### With Configuration

Pass context information:

```html
<script>
  window.VetChatbotConfig = {
    userId: "user_123",
    userName: "John Doe",
    petName: "Buddy",
    source: "marketing-website"
  };
</script>
<script src="https://your-domain.com/chatbot.js"></script>
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/session` | Create new chat session |
| POST | `/api/chat/message` | Send message and get AI response |
| GET | `/api/chat/history/:sessionId` | Get conversation history |
| GET | `/api/appointments` | List all appointments (admin) |
| GET | `/api/appointments/session/:sessionId` | Get session appointments |
| PATCH | `/api/appointments/:id/status` | Update appointment status |

## 🧠 Key Design Decisions

1. **TypeScript Everywhere**: Full type safety across frontend and backend
2. **Session-Based Storage**: Links conversations to appointments via sessionId
3. **State Machine for Booking**: Reliable multi-step appointment collection
4. **Veterinary System Prompt**: Enforces AI responses to stay on-topic
5. **IIFE SDK Bundle**: Self-executing for easy integration

## 🎮 Appointment Booking Flow

1. User expresses booking intent (e.g., "I want to book an appointment")
2. Bot asks for pet owner name → validates (min 2 chars)
3. Bot asks for pet name → validates (non-empty)
4. Bot asks for phone number → validates (min 10 digits)
5. Bot asks for preferred date/time → validates (future date)
6. Bot shows summary and asks for confirmation
7. On confirm: appointment saved to MongoDB
8. On cancel: booking state reset

## 📋 Assumptions & Design Decisions

| Assumption | Reasoning |
|------------|-----------|
| **No User Authentication** | Chatbot is designed for public-facing websites where visitors should interact without login barriers. User context is optional and passed via SDK config. |
| **Session-Based Conversations** | Each chat window gets a unique session ID. This allows anonymous users while still linking conversations to appointments. |
| **Gemini API for AI** | Google Gemini offers generous free tier and excellent instruction-following for domain-restricted responses. |
| **MongoDB Atlas** | Document-based storage is ideal for flexible chat messages and session data. Atlas provides free tier and easy cloud hosting. |
| **Server-Side AI Calls** | API key security - Gemini calls are made server-side to avoid exposing the API key in client JavaScript. |
| **Single Timezone** | Appointment times are stored in ISO format. Production would add timezone selection, but kept simple for MVP. |
| **Basic Phone Validation** | 10-digit minimum validation covers most international formats without complex regex. |
| **Date Picker over Text Input** | Added visual date picker to avoid date parsing issues - better UX than free-text input. |
| **State Machine for Booking** | Ensures reliable multi-step data collection. Each step validates before proceeding to next. |
| **IIFE SDK Bundle** | Self-executing function for zero-config embedding. Just add script tag and it works. |

## 🌐 Deployed Demo

- **Frontend**: https://koko-assignment-pi.vercel.app/
- **Backend API**: https://koko-assignment.onrender.com/
- **Admin Dashboard**: https://koko-assignment-pi.vercel.app/admin/

## 🔮 Future Improvements

1. **Authentication**: Add user authentication for secure access
2. **Appointment Reminders**: Email/SMS notifications for upcoming appointments
3. **Multi-language Support**: Internationalization for wider reach
4. **Voice Input**: Speech-to-text for hands-free interaction
5. **Analytics Dashboard**: Track chatbot usage and popular topics
6. **Appointment Calendar**: Visual calendar for slot selection
7. **Rate Limiting**: Protect API from abuse
8. **Caching**: Redis caching for frequently asked questions
9. **WebSocket**: Real-time updates for typing indicators
10. **Testing**: Expand test coverage with integration tests
