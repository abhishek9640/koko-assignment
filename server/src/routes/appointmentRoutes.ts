import { Router } from 'express';
import { getAppointments, getAllAppointments, updateAppointmentStatus, deleteAppointment } from '../controllers/appointmentController.js';

const router = Router();

// Get appointments for a session
router.get('/session/:sessionId', getAppointments);

// Get all appointments (admin)
router.get('/', getAllAppointments);

// Update appointment status
router.patch('/:id/status', updateAppointmentStatus);

// Delete appointment
router.delete('/:id', deleteAppointment);

export default router;
