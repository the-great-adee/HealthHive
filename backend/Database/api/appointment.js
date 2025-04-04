const express = require('express');
const bodyParser = require('body-parser');
const applicationRouter = express.Router();
const Appointment = require('../Models/Appointment');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const Doctor = require('../Models/Doctor');

function authenticateToken(req, res, next) {
	const token = req.headers['authorization'];

	if (!token) {
		return res.status(401).send('Token not provided');
	}

	const tokenParts = token.split(' ');
	const jwtToken = tokenParts[1];

	jwt.verify(jwtToken, JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).send('Invalid token');
		}
		req.user = decoded;
		next();
	});
}

applicationRouter.post('/getAppointmentsByPatient', authenticateToken, async (req, res) => {
	try {
		const { email } = req.body;
		const patientObj = {
			email: email,
		};
		const appointments = await Appointment.find({ patient: patientObj });

		if (appointments.length === 0) {
			return res.status(404).json({ message: 'No appointments found' });
		}

		return res.status(200).json(appointments);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

applicationRouter.post('/getAppointmentsByDoctor', authenticateToken, async (req, res) => {
	try {
		const { doctor } = req.body;
		const appointments = await Appointment.find({ doctor });

		if (appointments.length === 0) {
			return res.status(404).json({ message: 'No appointments found' });
		}
		return res.status(200).json(appointments);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

applicationRouter.post('/createAppointment', authenticateToken, async (req, res) => {
	try {
		const appointmentData = req.body;
		const newAppointment = new Appointment(appointmentData);
		const appointment = await newAppointment.save();

		return res.status(200).json(appointment);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

applicationRouter.post('/updateAppointment', authenticateToken, async (req, res) => {
	try {
		const appointmentData = req.body;
		const appointment = await Appointment.findByIdAndUpdate(appointmentData._id, appointmentData, { new: true });

		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}

		return res.status(200).json(appointment);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

applicationRouter.post('/deleteAppointment', authenticateToken, async (req, res) => {
	try {
		const { id } = req.body;
		const appointment = await Appointment.findByIdAndDelete(id);

		if (!appointment) {
			return res.status(404).json({ message: 'Appointment not found' });
		}

		return res.status(200).json(appointment);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

applicationRouter.post('/getStatistics', authenticateToken, async (req, res) => {
    try {
        const { doctor } = req.body;
        
        if (!doctor) {
            console.error('No doctor email provided in the request body.');
            return res.status(400).json({ message: 'Doctor email is required' });
        }

        // Get current date for today's calculations
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate start of current week (Sunday as first day)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // Log the doctor email to ensure it's correct
        console.log(`Fetching statistics for doctor: ${doctor}`);

        // Query for doctor by email
        const doctorData = await Doctor.findOne({ email: doctor });

        if (!doctorData) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        // Count today's appointments
        const todayAppointments = doctorData.patients.filter(patient => {
            const appointmentDate = new Date(patient.completionDate);
            return patient.status === 'appointment' &&
                   appointmentDate >= today && appointmentDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }).length;

        // Count pending consultations
        const pendingConsultations = doctorData.patients.filter(patient => patient.status === 'consultation').length;

        // Count this week's appointments and consultations
        const thisWeek = doctorData.patients.filter(patient => {
            const appointmentDate = new Date(patient.completionDate);
            return patient.status === 'appointment' || patient.status === 'consultation' && appointmentDate >= startOfWeek;
        }).length;

        // Count total completed consultations
        const totalCompleted = doctorData.patients.filter(patient => patient.status === 'completed').length;

        return res.status(200).json({
            todayAppointments,
            pendingConsultations,
            thisWeek,
            totalCompleted
        });
    } catch (error) {
        console.error('Error in getStatistics:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});




module.exports = applicationRouter;
