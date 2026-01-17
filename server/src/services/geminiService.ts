import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const VETERINARY_SYSTEM_PROMPT = `You are a friendly and knowledgeable veterinary assistant chatbot. Your role is to:

1. Answer questions ONLY about veterinary and pet-related topics including:
   - Pet care and wellness
   - Vaccination schedules and preventive care
   - Diet and nutrition for pets
   - Common pet illnesses and symptoms
   - General pet health advice
   - Pet behavior and training basics

2. If a user asks about booking an appointment, respond with exactly: "I'd be happy to help you book a veterinary appointment! Let me collect some information."

3. If a user asks about topics NOT related to veterinary care or pets, politely decline by saying something like: "I'm a veterinary assistant and can only help with pet-related questions. Is there anything about your pet's health or care I can help with?"

4. Always be empathetic, professional, and helpful.
5. Never provide specific medical diagnoses - always recommend consulting a veterinarian for serious concerns.
6. Keep responses concise but informative.

7. APPOINTMENT CONTEXT: If the user's message includes "[SYSTEM CONTEXT - User's booked appointments...]", use that information to answer questions about their appointments. You can tell them their appointment details, remind them of upcoming visits, or help with appointment-related queries.

Remember: You cannot help with general knowledge questions, coding, math, or any non-veterinary topics.`;

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export async function generateVetResponse(
    userMessage: string,
    conversationHistory: ChatMessage[]
): Promise<string> {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: VETERINARY_SYSTEM_PROMPT,
        });

        // Filter history to ensure it starts with a 'user' role message
        // Gemini API requires the first message in history to be from 'user'
        let filteredHistory = conversationHistory;
        while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
            filteredHistory = filteredHistory.slice(1);
        }

        const chat = model.startChat({
            history: filteredHistory,
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('Failed to generate AI response');
    }
}

export function detectAppointmentIntent(message: string): boolean {
    const lowerMessage = message.toLowerCase();

    // Phrases that indicate VIEWING existing appointments, NOT creating new ones
    const viewingPhrases = [
        'show my',
        'what is my',
        "what's my",
        'when is my',
        "when's my",
        'my current',
        'my existing',
        'my upcoming',
        'remind me',
        'check my',
        'view my',
        'see my',
        'list my',
        'details of my',
    ];

    // If user is asking to VIEW appointments, don't trigger booking flow
    if (viewingPhrases.some(phrase => lowerMessage.includes(phrase))) {
        return false;
    }

    // Keywords that indicate BOOKING intent
    const bookingKeywords = [
        'book',
        'appointment',
        'schedule',
        'visit',
        'checkup',
        'check-up',
        'booking',
        'reserve',
        'slot',
        'meet the vet',
        'see the vet',
        'vet visit',
    ];

    return bookingKeywords.some(keyword => lowerMessage.includes(keyword));
}
