const express = require('express');
const bodyParser = require('body-parser');
const patientRouter = express.Router();
const Patient = require('../Models/Patient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

function generateToken(user, role) {
	return jwt.sign({ userId: user._id, email: user.email, role: role }, JWT_SECRET, { expiresIn: '1h' });
}

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

patientRouter.post('/loginPatient', async (req, res) => {
	try {
		const { email, password } = req.body;
		const patient = await Patient.findOne({ email: email });
		if (!patient) return res.status(404).send('No account found with this email address. Please sign up!');
		const isPasswordCorrect = await bcrypt.compare(password, patient.password);
		if (!isPasswordCorrect) return res.status(400).send('Incorrect password');

		const token = generateToken(patient, 'patient');
		return res.json({ token });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

patientRouter.post('/getPatientsByIds', authenticateToken, async (req, res) => {
	try {
		const { ids } = req.body;
		const patients = await Patient.find({ _id: { $in: ids } });

		if (patients.length === 0) {
			return res.status(404).json({ message: 'No patients found' });
		}

		return res.status(200).json(patients);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

patientRouter.post('/getByEmail', authenticateToken, async (req, res) => {
	try {
		const { email } = req.body;
		const patient = await Patient.findOne({ email });
		if (!patient) return res.status(404).json({ message: 'Patient not found' });
		return res.json(patient);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

patientRouter.post('/createPatient', async (req, res) => {
	try {
		const patientData = req.body;
		const patient = await Patient.findOne({ email: patientData.email });
		if (patient) return res.status(400).send('Email already in use!');

		const password = patientData.password;
		const hashedPassword = await bcrypt.hash(password, 10);
		const newPatientData = {
			...patientData,
			password: hashedPassword,
		};
		const newPatient = new Patient(newPatientData);
		await newPatient.save();

		const token = generateToken(newPatient, 'patient');
		return res.json({ token });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

patientRouter.post('/updatePatient', authenticateToken, async (req, res) => {
	try {
		const patientData = req.body;
		const patient = await Patient.findOneAndUpdate({ email: patientData.email }, patientData, { new: true });

		if (!patient) {
			return res.status(404).json({ message: 'Patient not found' });
		}
		return res.status(200).json(patient);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

patientRouter.delete('/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const deletedPatient = await Patient.findByIdAndDelete(id);

		if (!deletedPatient) {
			return res.status(404).json({ message: 'Patient not found' });
		}

		return res.status(200).json({ message: 'Patient deleted successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});


patientRouter.post('/getStatistics', authenticateToken, async (req, res) => {
	try {
	  const { patient } = req.body;
	  
	  if (!patient) {
		return res.status(400).json({ error: 'Patient email is required' });
	  }
  
	  // Find the patient first to verify they exist
	  const patientData = await Patient.findOne({ email: patient });
	  
	  if (!patientData) {
		return res.status(404).json({ error: 'Patient not found' });
	  }
	  
	  // Get current date for today's calculations
	  const today = new Date();
	  today.setHours(0, 0, 0, 0);  // Start of today
	  
	  // Get date for one month ago
	  const oneMonthAgo = new Date();
	  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	  oneMonthAgo.setHours(0, 0, 0, 0);
	  
	  // Count of pending consultations
	  const pendingConsultations = patientData.doctor.filter(doc => 
		doc.status === 'consultation'
	  ).length;
	  
	  // Count of upcoming appointments
	  const upcomingAppointments = patientData.doctor.filter(doc => 
		doc.status === 'appointment' && 
		new Date(doc.date) >= today
	  ).length;
	  
	  // Count of appointments/visits in the current month
	  const thisMonth = patientData.doctor.filter(doc => 
		doc.status === 'completed' && 
		new Date(doc.date) >= oneMonthAgo
	  ).length;
	  
	  // Count of total completed visits
	  const totalCompleted = patientData.doctor.filter(doc => 
		doc.status === 'completed'
	  ).length;
	  
	  return res.status(200).json({
		pendingConsultations,
		upcomingAppointments,
		thisMonth,
		totalVisits: totalCompleted
	  });
	  
	} catch (error) {
	  console.error('Error getting patient statistics:', error);
	  return res.status(500).json({ error: 'Failed to get statistics' });
	}
  });

module.exports = patientRouter;
