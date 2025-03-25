const express = require('express');
const bodyParser = require('body-parser');
const doctorRouter = express.Router();
const Doctor = require('../Models/Doctor');
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

doctorRouter.post('/loginDoctor', async (req, res) => {
	try {
		const { email, password } = req.body;
		const doctor = await Doctor.findOne({ email: email });
		if (!doctor) return res.status(404).send('No account found with this email address. Please sign up!');
		const isPasswordCorrect = await bcrypt.compare(password, doctor.password);
		if (!isPasswordCorrect) return res.status(400).send('Incorrect password');

		const token = generateToken(doctor, 'doctor');
		return res.json({ token });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

doctorRouter.post('/getDoctorsByIds', authenticateToken, async (req, res) => {
	try {
		const { ids } = req.body;
		const doctors = await Doctor.find({ _id: { $in: ids } });

		if (doctors.length === 0) {
			return res.status(404).json({ message: 'No doctors found' });
		}

		return res.status(200).json(doctors);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

doctorRouter.post('/getByLocation', authenticateToken, async (req, res) => {
	try {
		const { location } = req.body;
		const doctors = await Doctor.find({ location });

		if (doctors.length === 0) {
			return res.status(404).json({ message: 'No doctors found' });
		}
		return res.status(200).json(doctors);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

doctorRouter.post('/getByEmail', authenticateToken, async (req, res) => {
	try {
		const { email } = req.body;
		const doctor = await Doctor.findOne({ email });
		if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
		res.json(doctor);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

doctorRouter.post('/createDoctor', async (req, res) => {
	try {
		const doctorData = req.body;
		const doctor = await Doctor.findOne({ email: doctorData.email });
		if (doctor) return res.status(400).send('Doctor already exists');

		const password = doctorData.password;
		const hashedPassword = await bcrypt.hash(password, 10);

		const newDoctorData = {
			...doctorData,
			password: hashedPassword,
		};

		const newDoctor = new Doctor(newDoctorData);
		await newDoctor.save();

		const token = generateToken(newDoctor, 'doctor');
		return res.json({ token });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

doctorRouter.post('/updateDoctor', authenticateToken, async (req, res) => {
	try {
		const doctorData = req.body;
		const doctor = await Doctor.findOneAndUpdate({ email: doctorData.email }, doctorData, { new: true });

		if (!doctor) {
			return res.status(404).json({ message: 'Doctor not found' });
		}

		return res.status(200).json(doctor);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

doctorRouter.delete('/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const deletedDoctor = await Doctor.findByIdAndDelete(id);

		if (!deletedDoctor) {
			return res.status(404).json({ message: 'Doctor not found' });
		}

		return res.status(200).json({ message: 'Doctor deleted successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = doctorRouter;
