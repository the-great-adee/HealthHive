const express = require('express');
const bodyParser = require('body-parser');
const applicationRouter = express.Router();
const Appointment = require('../Models/Appointment');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

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

module.exports = applicationRouter;
