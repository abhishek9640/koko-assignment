import { Session, ISession } from '../models/Session.js';
import { Appointment } from '../models/Appointment.js';

type BookingStep = 'idle' | 'ownerName' | 'petName' | 'phone' | 'dateTime' | 'confirm';

interface BookingResponse {
    message: string;
    appointmentCreated: boolean;
    appointmentId?: string;
}

const BOOKING_PROMPTS: Record<BookingStep, string> = {
    idle: '',
    ownerName: "Great! Let's book your appointment. What is the pet owner's name?",
    petName: "Thank you! And what is your pet's name?",
    phone: "Perfect! What phone number can we reach you at?",
    dateTime: "Almost done! When would you prefer to schedule the appointment? (Please provide date and time, e.g., 'January 20, 2026 at 3:00 PM')",
    confirm: '',
};

function validatePhoneNumber(phone: string): boolean {
    // Basic phone validation - at least 10 digits
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
}

function parseDateTime(input: string): Date | null {
    try {
        // Normalize the input - remove "at" and extra spaces
        let normalized = input
            .replace(/\bat\b/gi, ' ')  // Remove word "at"
            .replace(/\s+/g, ' ')       // Collapse multiple spaces
            .trim();

        // Try parsing the normalized string
        let date = new Date(normalized);
        if (!isNaN(date.getTime())) {
            return date;
        }

        // Try original input
        date = new Date(input);
        if (!isNaN(date.getTime())) {
            return date;
        }

        // Try parsing with common formats
        // Format: "January 20, 2026 3:00 PM"
        const dateTimeRegex = /^(\w+)\s+(\d{1,2}),?\s*(\d{4})?\s*(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;
        const match = normalized.match(dateTimeRegex);
        if (match) {
            const [, month, day, year, hour, minute, ampm] = match;
            const actualYear = year || new Date().getFullYear().toString();
            let hours = parseInt(hour, 10);

            if (ampm) {
                if (ampm.toUpperCase() === 'PM' && hours !== 12) {
                    hours += 12;
                } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
                    hours = 0;
                }
            }

            const dateStr = `${month} ${day}, ${actualYear} ${hours.toString().padStart(2, '0')}:${minute}:00`;
            date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
            }
        }

        // Try adding current year if not present
        const now = new Date();
        const attemptWithYear = new Date(`${normalized} ${now.getFullYear()}`);
        if (!isNaN(attemptWithYear.getTime())) {
            return attemptWithYear;
        }

        return null;
    } catch {
        return null;
    }
}

export async function handleBookingFlow(
    session: ISession,
    userMessage: string
): Promise<BookingResponse> {
    const state = session.bookingState || {
        inProgress: false,
        step: 'idle' as BookingStep,
        collectedData: {},
    };

    // Start booking flow
    if (!state.inProgress) {
        session.bookingState = {
            inProgress: true,
            step: 'ownerName',
            collectedData: {},
        };
        session.markModified('bookingState');
        await session.save();
        return {
            message: BOOKING_PROMPTS.ownerName,
            appointmentCreated: false,
        };
    }

    const trimmedMessage = userMessage.trim();

    switch (state.step) {
        case 'ownerName':
            if (trimmedMessage.length < 2) {
                return {
                    message: "Please provide a valid name (at least 2 characters).",
                    appointmentCreated: false,
                };
            }
            session.bookingState!.collectedData.ownerName = trimmedMessage;
            session.bookingState!.step = 'petName';
            session.markModified('bookingState');
            await session.save();
            return {
                message: BOOKING_PROMPTS.petName,
                appointmentCreated: false,
            };

        case 'petName':
            if (trimmedMessage.length < 1) {
                return {
                    message: "Please provide your pet's name.",
                    appointmentCreated: false,
                };
            }
            session.bookingState!.collectedData.petName = trimmedMessage;
            session.bookingState!.step = 'phone';
            session.markModified('bookingState');
            await session.save();
            return {
                message: BOOKING_PROMPTS.phone,
                appointmentCreated: false,
            };

        case 'phone':
            if (!validatePhoneNumber(trimmedMessage)) {
                return {
                    message: "Please provide a valid phone number (at least 10 digits).",
                    appointmentCreated: false,
                };
            }
            session.bookingState!.collectedData.phoneNumber = trimmedMessage;
            session.bookingState!.step = 'dateTime';
            session.markModified('bookingState');
            await session.save();
            return {
                message: BOOKING_PROMPTS.dateTime,
                appointmentCreated: false,
            };

        case 'dateTime':
            const parsedDate = parseDateTime(trimmedMessage);
            if (!parsedDate) {
                return {
                    message: "I couldn't understand that date/time. Please try again (e.g., 'January 20, 2026 at 3:00 PM').",
                    appointmentCreated: false,
                };
            }
            if (parsedDate < new Date()) {
                return {
                    message: "That date seems to be in the past. Please provide a future date and time.",
                    appointmentCreated: false,
                };
            }
            session.bookingState!.collectedData.preferredDateTime = parsedDate.toISOString();
            session.bookingState!.step = 'confirm';
            session.markModified('bookingState');
            await session.save();

            const data = session.bookingState!.collectedData;
            const confirmMessage = `Great! Here's a summary of your appointment request:

📋 **Appointment Details**
• Pet Owner: ${data.ownerName}
• Pet Name: ${data.petName}
• Phone: ${data.phoneNumber}
• Preferred Time: ${parsedDate.toLocaleString()}

Please type **"confirm"** to book this appointment or **"cancel"** to start over.`;

            return {
                message: confirmMessage,
                appointmentCreated: false,
            };

        case 'confirm':
            const lowerMessage = trimmedMessage.toLowerCase();
            if (lowerMessage === 'confirm' || lowerMessage === 'yes') {
                // Spread to create a copy - avoids reference being cleared when we reset bookingState
                const appointmentData = { ...session.bookingState!.collectedData };

                const appointment = await Appointment.create({
                    sessionId: session.sessionId,
                    ownerName: appointmentData.ownerName,
                    petName: appointmentData.petName,
                    phoneNumber: appointmentData.phoneNumber,
                    preferredDateTime: new Date(appointmentData.preferredDateTime!),
                    status: 'pending',
                });

                // Reset booking state
                session.bookingState = {
                    inProgress: false,
                    step: 'idle',
                    collectedData: {},
                };
                session.markModified('bookingState');
                await session.save();

                return {
                    message: `🎉 **Appointment Booked Successfully!**

Your appointment has been scheduled. Here are your details:
• Appointment ID: ${appointment._id}
• Pet Owner: ${appointmentData.ownerName}
• Pet Name: ${appointmentData.petName}
• Date/Time: ${new Date(appointmentData.preferredDateTime!).toLocaleString()}

We'll contact you at ${appointmentData.phoneNumber} to confirm. Is there anything else I can help you with?`,
                    appointmentCreated: true,
                    appointmentId: appointment._id.toString(),
                };
            } else if (lowerMessage === 'cancel' || lowerMessage === 'no') {
                session.bookingState = {
                    inProgress: false,
                    step: 'idle',
                    collectedData: {},
                };
                session.markModified('bookingState');
                await session.save();

                return {
                    message: "No problem! I've cancelled the booking process. Feel free to ask me any veterinary questions or start a new appointment booking whenever you're ready.",
                    appointmentCreated: false,
                };
            } else {
                return {
                    message: 'Please type **"confirm"** to book the appointment or **"cancel"** to start over.',
                    appointmentCreated: false,
                };
            }

        default:
            return {
                message: "Something went wrong. Let's start over. Would you like to book an appointment?",
                appointmentCreated: false,
            };
    }
}

export function isBookingInProgress(session: ISession): boolean {
    return session.bookingState?.inProgress || false;
}
