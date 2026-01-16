# Veterinary Chatbot SDK - Architecture

## System Overview

```mermaid
flowchart TB
    subgraph Client["Client (React + Vite)"]
        SDK[SDK Bundle]
        CW[ChatWidget]
        DTP[DateTimePicker]
        API[API Service]
    end
    
    subgraph Server["Server (Express + TypeScript)"]
        Routes[API Routes]
        Controllers[Controllers]
        Services[Services]
        Models[Mongoose Models]
    end
    
    subgraph External["External Services"]
        Gemini[Google Gemini API]
        MongoDB[(MongoDB Atlas)]
    end
    
    SDK --> CW
    CW --> DTP
    CW --> API
    API -->|HTTP| Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Models
    Services -->|AI Chat| Gemini
    Models -->|CRUD| MongoDB
```

## Component Details

### Client Components
| Component | Description |
|-----------|-------------|
| `SDK` | Embeddable script that initializes the chatbot widget |
| `ChatWidget` | Main container with toggle button |
| `ChatWindow` | Message display and input handling |
| `DateTimePicker` | Visual date/time selector for appointments |
| `useChat` | React hook managing chat state and API calls |

### Server Components
| Component | Description |
|-----------|-------------|
| `chatRoutes` | Session and message endpoints |
| `appointmentRoutes` | Appointment CRUD operations |
| `geminiService` | Gemini API integration with vet-specific prompts |
| `appointmentService` | Booking flow state machine |
| `Session` | Chat session with messages and booking state |
| `Appointment` | Appointment data model |

## API Endpoints

### Chat API
```
POST   /api/chat/session     - Create new chat session
POST   /api/chat/message     - Send message, get AI response
GET    /api/chat/history/:id - Get session message history
```

### Appointments API
```
POST   /api/appointments     - Create appointment
GET    /api/appointments     - List all appointments
GET    /api/appointments/:id - Get single appointment
PATCH  /api/appointments/:id - Update appointment status
DELETE /api/appointments/:id - Delete appointment
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Widget
    participant Server
    participant Gemini
    participant MongoDB
    
    User->>Widget: Open chat
    Widget->>Server: POST /chat/session
    Server->>MongoDB: Create session
    Server-->>Widget: Session ID + Welcome
    
    User->>Widget: Type message
    Widget->>Server: POST /chat/message
    Server->>Gemini: Generate response
    Gemini-->>Server: AI response
    Server->>MongoDB: Save messages
    Server-->>Widget: Bot response
    
    User->>Widget: Book appointment
    Widget->>Server: POST /chat/message
    Server->>Server: Booking flow (multi-step)
    Server->>MongoDB: Create appointment
    Server-->>Widget: Confirmation
```

## Booking State Machine

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> ownerName: "book appointment"
    ownerName --> petName: valid name
    petName --> phone: valid name
    phone --> dateTime: valid phone
    dateTime --> confirm: valid date
    confirm --> [*]: "confirm"
    confirm --> [*]: "cancel"
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas, Mongoose |
| AI | Google Gemini 2.5 Flash |
| Styling | Vanilla CSS (dark theme) |
