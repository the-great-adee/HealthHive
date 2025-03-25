require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../backend/server');
const mongoose = require('mongoose');
const Prescription = require('../../backend/Database/Models/Prescription');

chai.use(chaiHttp);
const expect = chai.expect;

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const token = jwt.sign({ _id: '123' }, JWT_SECRET);

describe('Prescription API Tests', () => {
	before(async () => {
		if (mongoose.connection.readyState === 0) {
			await mongoose.connect('mongodb://localhost:27017/omcs-test', {});
			console.log('Database connected and up at port 27017!');
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await Prescription.deleteMany({});
	});

	after(async () => {
		await mongoose.disconnect();
	});

	describe('POST /prescription/createPrescription', () => {
		it('should create a new prescription', async () => {
			const res = await chai.request(app).post('/prescription/createPrescription').set('Authorization', `Bearer ${token}`).send({
				patientEmail: 'patient@example.com',
				doctorEmail: 'doctor@example.com',
				content: 'Take this medicine every day.',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('content');
		});
	});

	describe('POST /prescription/getPrescription', () => {
		it('should return a prescription', async () => {
			const prescription = await Prescription.findOne({ patientEmail: 'patient@example.com' });
			const res = await chai.request(app).post('/prescription/getPrescription').set('Authorization', `Bearer ${token}`).send({
				id: prescription._id,
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('content');
		});

		it('should return 404 for an invalid prescription', async () => {
			const res = await chai.request(app).post('/prescription/getPrescription').set('Authorization', `Bearer ${token}`).send({
				id: new mongoose.Types.ObjectId(),
			});
			expect(res.status).to.equal(404);
		});
	});

	describe('POST /prescription/getPrescriptionsByPatient', () => {
		it('should return prescriptions for a patient', async () => {
			const res = await chai.request(app).post('/prescription/getPrescriptionsByPatient').set('Authorization', `Bearer ${token}`).send({
				patient: 'patient@example.com',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
		});

		it('should return 404 for a patient with no prescriptions', async () => {
			const res = await chai.request(app).post('/prescription/getPrescriptionsByPatient').set('Authorization', `Bearer ${token}`).send({
				patient: 'nonexistent@user.com',
			});
			expect(res.status).to.equal(404);
		});
	});

	describe('POST /prescription/getPrescriptionsByDoctor', () => {
		it('should return prescriptions for a doctor', async () => {
			const res = await chai.request(app).post('/prescription/getPrescriptionsByDoctor').set('Authorization', `Bearer ${token}`).send({
				doctor: 'doctor@example.com',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
		});

		it('should return 404 for a doctor with no prescriptions', async () => {
			const res = await chai.request(app).post('/prescription/getPrescriptionsByDoctor').set('Authorization', `Bearer ${token}`).send({
				doctor: 'nonexistent@doctor.net',
			});
			expect(res.status).to.equal(404);
		});
	});

	describe('POST /prescription/updatePrescription', () => {
		it('should update a prescription', async () => {
			const prescription = await Prescription.findOne({ patientEmail: 'patient@example.com' });
			const res = await chai.request(app).post('/prescription/updatePrescription').set('Authorization', `Bearer ${token}`).send({
				_id: prescription._id,
				content: 'Take this medicine twice a day.',
			});
			expect(res.status).to.equal(200);
			expect(res.body.content).to.not.equal(prescription.content);
		});

		it('should return 404 for an invalid prescription', async () => {
			const res = await chai.request(app).post('/prescription/updatePrescription').set('Authorization', `Bearer ${token}`).send({
				id: new mongoose.Types.ObjectId(),
				content: 'Take this medicine twice a day.',
			});
			expect(res.status).to.equal(404);
		});
	});

	describe('POST /prescription/deletePrescription', () => {
		it('should delete a prescription', async () => {
			const prescription = await Prescription.findOne({ patientEmail: 'patient@example.com' });
			const res = await chai.request(app).post('/prescription/deletePrescription').set('Authorization', `Bearer ${token}`).send({
				id: prescription._id,
			});
			expect(res.status).to.equal(200);
		});

		it('should return 404 for an invalid prescription', async () => {
			const res = await chai.request(app).post('/prescription/deletePrescription').set('Authorization', `Bearer ${token}`).send({
				id: new mongoose.Types.ObjectId(),
			});
			expect(res.status).to.equal(404);
		});
	});
});
