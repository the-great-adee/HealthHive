const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
	{
		name: { type: String, default: '' },
		email: { type: String },
		password: { type: String },
		specialisation: { type: String, default: '' },
		certification: { type: String, default: '' },
		location: { type: String, default: '' },
		clinic: { type: String, default: '' },
		workingHours: [
			{
				day: { type: String },
				from: { type: String },
				to: { type: String },
			},
		],
		patients: [
			{
				email: { type: String, required: true },
				status: { type: String, required: true },
				symptoms: { type: String, default: '' },
				id: {
					type: mongoose.Schema.Types.ObjectId,
					required: true,
				},
				completionDate: { type: Date },
				feedback: { type: String, default: '' },
			},
		],
	},
	{ collection: 'doctor' }
);

module.exports = mongoose.model('Doctor', doctorSchema);
