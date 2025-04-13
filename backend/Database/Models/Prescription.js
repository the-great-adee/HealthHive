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
		// New fields for medical store integration
		prescribedProducts: [
			{
				product: {
					type: mongoose.Schema.Types.ObjectId,
					ref: 'Product'
				},
				productName: { type: String }, // Store name for quick reference
				dosage: { type: String },
				frequency: { type: String },
				duration: { type: String },
				instructions: { type: String }
			}
		],
		issueDate: {
			type: Date,
			default: Date.now
		},
		expiryDate: {
			type: Date,
			default: function() {
				// Default expiry: 30 days from issue
				const date = new Date();
				date.setDate(date.getDate() + 30);
				return date;
			}
		},
		status: {
			type: String,
			enum: ['active', 'filled', 'expired', 'cancelled'],
			default: 'active'
		}
	},
	{ collection: 'prescription' }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);