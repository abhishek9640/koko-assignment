import React, { useState } from 'react';

interface DateTimePickerProps {
    onSelect: (dateTime: string) => void;
    onCancel: () => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ onSelect, onCancel }) => {
    // Set minimum date to today
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];

    // Default to tomorrow at 10:00 AM
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(defaultDate);
    const [selectedTime, setSelectedTime] = useState('10:00');

    const handleConfirm = () => {
        if (selectedDate && selectedTime) {
            const dateTime = new Date(`${selectedDate}T${selectedTime}`);
            // Format as a readable string for the chat
            const formatted = dateTime.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
            onSelect(formatted);
        }
    };

    return (
        <div className="vet-datetime-picker">
            <div className="vet-datetime-header">
                <span className="vet-datetime-icon">📅</span>
                <span>Select Appointment Date & Time</span>
            </div>

            <div className="vet-datetime-inputs">
                <div className="vet-datetime-field">
                    <label htmlFor="appointment-date">Date</label>
                    <input
                        id="appointment-date"
                        type="date"
                        value={selectedDate}
                        min={minDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="vet-datetime-input"
                    />
                </div>

                <div className="vet-datetime-field">
                    <label htmlFor="appointment-time">Time</label>
                    <input
                        id="appointment-time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="vet-datetime-input"
                    />
                </div>
            </div>

            <div className="vet-datetime-actions">
                <button
                    type="button"
                    className="vet-datetime-btn vet-datetime-cancel"
                    onClick={onCancel}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="vet-datetime-btn vet-datetime-confirm"
                    onClick={handleConfirm}
                    disabled={!selectedDate || !selectedTime}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
};
