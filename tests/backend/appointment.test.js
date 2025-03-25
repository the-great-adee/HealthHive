require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../backend/server');
const mongoose = require('mongoose');
const Appointment = require('../../backend/Database/Models/Appointment');

chai.use(chaiHttp);
const expect = chai.expect;

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const token = jwt.sign({ _id: '123' }, JWT_SECRET);

describe('Appointment API Tests', () => {
	before(async () => {
		if (mongoose.connection.readyState === 0) {
			await mongoose.connect('mongodb://localhost:27017/omcs-test', {});
			console.log('Database connected and up at port 27017!');
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await Appointment.deleteMany({});
	});

	after(async () => {
		await mongoose.disconnect();
	});

	describe('POST /appointment/createAppointment', () => {
		it('should create a new appointment', async () => {
			const res = await chai
				.request(app)
				.post('/appointment/createAppointment')
				.set('Authorization', `Bearer ${token}`)
				.send({
					patient: {
						email: 'patient@example.com',
					},
					doctor: {
						email: 'doctor@example.com',
					},
					date: new Date(),
					time: '12:00',
				});
			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('date');
			expect(res.body).to.have.property('time');
		});
	});

	describe('POST /appointment/getAppointmentsByPatient', () => {
		it('should return appointments for a patient', async () => {
			const res = await chai.request(app).post('/appointment/getAppointmentsByPatient').set('Authorization', `Bearer ${token}`).send({
				email: 'patient@example.com',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
		});

		it('should return 404 for a patient with no appointments', async () => {
			const res = await chai.request(app).post('/appointment/getAppointmentsByPatient').set('Authorization', `Bearer ${token}`).send({
				email: 'no_appointments@example.com',
			});
			expect(res.status).to.equal(404);
		});
	});

	describe('POST /appointment/getAppointmentsByDoctor', () => {
		it('should return appointments for a doctor', async () => {
			const res = await chai
				.request(app)
				.post('/appointment/getAppointmentsByDoctor')
				.set('Authorization', `Bearer ${token}`)
				.send({
					doctor: {
						email: 'doctor@example.com',
					},
				});
			expect(res.status).to.equal(200);
			expect(res.body).to.be.an('array');
		}),
			it('should return 404 for a doctor with no appointments', async () => {
				const res = await chai
					.request(app)
					.post('/appointment/getAppointmentsByDoctor')
					.set('Authorization', `Bearer ${token}`)
					.send({
						doctor: {
							email: 'empty_schedule@example.com',
						},
					});
				expect(res.status).to.equal(404);
			});
	});

	describe('POST /appointment/updateAppointment', () => {
		it('should update an appointment', async () => {
			const appointment = await Appointment.findOne({ patient: { email: 'patient@example.com' } });
			const res = await chai.request(app).post('/appointment/updateAppointment').set('Authorization', `Bearer ${token}`).send({
				id: appointment._id,
				date: new Date(),
				time: '13:00',
			});
			expect(res.body.date).to.not.equal(appointment.date);
			expect(res.body.time).to.not.equal(appointment.time);
		});

		it('should return 404 for an appointment that does not exist', async () => {
			const res = await chai.request(app).post('/appointment/updateAppointment').set('Authorization', `Bearer ${token}`).send({
				id: new mongoose.Types.ObjectId(),
				date: new Date(),
				time: '13:00',
			});
			expect(res.status).to.equal(404);
		});
	});

	describe('POST /appointment/deleteAppointment', () => {
		it('should delete an appointment', async () => {
			const appointment = await Appointment.findOne({ patient: { email: 'patient@example.com' }, doctor: { email: 'doctor@example.com' } });
			const res = await chai.request(app).post('/appointment/deleteAppointment').set('Authorization', `Bearer ${token}`).send({
				id: appointment._id,
			});
			expect(res.status).to.equal(200);
		});

		it('should return 404 for an appointment that does not exist', async () => {
			const res = await chai.request(app).post('/appointment/deleteAppointment').set('Authorization', `Bearer ${token}`).send({
				id: new mongoose.Types.ObjectId(),
			});
			expect(res.status).to.equal(404);
		});
	});
});
