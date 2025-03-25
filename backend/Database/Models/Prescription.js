const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
	{
		patientEmail: {
			type: String,
			required: true,
		},
		doctorEmail: {
			type: String,
			required: true,
		},
		content: { type: String, required: true, default: '' },
	},
	{ collection: 'prescription' }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
