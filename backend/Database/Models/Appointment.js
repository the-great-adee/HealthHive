const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            email: { type: String, required: true }
        },
        doctor: {
            email: { type: String, required: true }
        },
        date: { type: Date, required: true },
        time: { type: String, required: true },
        status: { type: String, required: true, enum: ['appointment', 'consultation', 'completed'] } // Add status field
    },
    { collection: 'appointment' }
);

module.exports = mongoose.model('Appointment', appointmentSchema);
