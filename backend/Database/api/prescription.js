const express = require('express');
const bodyParser = require('body-parser');
const prescriptionRouter = express.Router();
const Prescription = require('../Models/Prescription');
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

prescriptionRouter.post('/getPrescription', authenticateToken, async (req, res) => {
	try {
		const { id } = req.body;
		const prescription = await Prescription.findById(id);

		if (!prescription) {
			return res.status(404).json({ message: 'Prescription not found' });
		}

		return res.status(200).json(prescription);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

prescriptionRouter.post('/getPrescriptionsByPatient', authenticateToken, async (req, res) => {
	try {
		const { patient } = req.body;
		const prescriptions = await Prescription.find({ patientEmail: patient });

		if (prescriptions.length === 0) {
			return res.status(404).json({ message: 'No prescriptions found' });
		}

		return res.status(200).json(prescriptions);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

prescriptionRouter.post('/getPrescriptionsByDoctor', authenticateToken, async (req, res) => {
	try {
		const { doctor } = req.body;
		const prescriptions = await Prescription.find({ doctorEmail: doctor });

		if (prescriptions.length === 0) {
			return res.status(404).json({ message: 'No prescriptions found' });
		}

		return res.status(200).json(prescriptions);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

prescriptionRouter.post('/createPrescription', authenticateToken, async (req, res) => {
	try {
		const prescriptionData = req.body;
		const newPrescription = new Prescription(prescriptionData);
		const savedPrescription = await newPrescription.save();

		return res.status(200).json(savedPrescription);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

prescriptionRouter.post('/updatePrescription', authenticateToken, async (req, res) => {
	try {
		const prescriptionData = req.body;
		const updatedPrescription = await Prescription.findByIdAndUpdate(prescriptionData._id, prescriptionData, { new: true });

		if (!updatedPrescription) {
			return res.status(404).json({ message: 'Prescription not found' });
		}
		return res.status(200).json(updatedPrescription);
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

prescriptionRouter.post('/deletePrescription', authenticateToken, async (req, res) => {
	try {
		const { id } = req.body;
		const deletedPrescription = await Prescription.findByIdAndDelete(id);

		if (!deletedPrescription) {
			return res.status(404).json({ message: 'Prescription not found' });
		}

		return res.status(200).json({ message: 'Prescription deleted successfully' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ message: 'Internal server error' });
	}
});

module.exports = prescriptionRouter;
