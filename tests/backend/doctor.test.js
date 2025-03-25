const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../backend/server');
const mongoose = require('mongoose');
const Doctor = require('../../backend/Database/Models/Doctor');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Doctor API Tests', () => {
	before(async () => {
		if (mongoose.connection.readyState === 0) {
			await mongoose.connect('mongodb://localhost:27017/omcs-test', {});
			console.log('Database connected and up at port 27017!');
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await Doctor.deleteMany({});
	});

	after(async () => {
		await mongoose.disconnect();
	});

	let token = '';

	describe('POST /doctor/createDoctor', () => {
		it('should create a new doctor', async () => {
			const res = await chai.request(app).post('/doctor/createDoctor').send({
				name: 'Test Doctor',
				email: 'valid@email.com',
				password: 'password123',
				password: 'password123',
				specialisation: 'Cardiologist',
				location: 'Bangalore',
				clinic: 'Apollo',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('token');
			token = res.body.token;
		});

		it('should return 400 for an existing doctor', async () => {
			const res = await chai.request(app).post('/doctor/createDoctor').send({
				name: 'Test Doctor',
				email: 'valid@email.com',
				password: 'password123',
				specialisation: 'Cardiologist',
				location: 'Bangalore',
				clinic: 'Apollo',
			});
			expect(res.status).to.equal(400);
		});
	});

	describe('POST /doctor/loginDoctor', () => {
		it('should return a token for a valid doctor', async () => {
			const res = await chai.request(app).post('/doctor/loginDoctor').send({
				email: 'valid@email.com',
				password: 'password123',
			});

			expect(res).to.have.status(200);
			expect(res.body).to.have.property('token');
		});

		it('should return 404 for an invalid email', async () => {
			const res = await chai.request(app).post('/doctor/loginDoctor').send({
				email: 'invalid@email.com',
				password: 'password123',
			});

			expect(res).to.have.status(404);
		});

		it('should return 400 for an invalid password', async () => {
			const res = await chai.request(app).post('/doctor/loginDoctor').send({
				email: 'valid@email.com',
				password: 'invalidpassword',
			});

			expect(res).to.have.status(400);
		});
	});

	describe('POST /doctor/getDoctorsByIds', () => {
		it('should return an array of doctors for valid ids', async () => {
			const doctor = await Doctor.findOne({ email: 'valid@email.com' });
			const res = await chai
				.request(app)
				.post('/doctor/getDoctorsByIds')
				.set('Authorization', `Bearer ${token}`)
				.send({
					ids: [doctor._id],
				});

			expect(res).to.have.status(200);
			expect(res.body).to.be.an('array');
			expect(res.body[0]).to.have.property('name');
		});

		it('should return a 404 for invalid ids', async () => {
			const invalidId = new mongoose.Types.ObjectId().toString();
			const res = await chai
				.request(app)
				.post('/doctor/getDoctorsByIds')
				.set('Authorization', `Bearer ${token}`)
				.send({
					ids: [invalidId],
				});

			expect(res).to.have.status(404);
		});
	});

	describe('POST /doctor/getByLocation', () => {
		it('should return an array of doctors for a valid location', async () => {
			const res = await chai.request(app).post('/doctor/getByLocation').set('Authorization', `Bearer ${token}`).send({
				location: 'Bangalore',
			});

			expect(res).to.have.status(200);
			expect(res.body).to.be.an('array');
			expect(res.body[0]).to.have.property('name');
		});

		it('should return a 404 for an invalid location', async () => {
			const res = await chai.request(app).post('/doctor/getByLocation').set('Authorization', `Bearer ${token}`).send({
				location: 'Invalid Location',
			});

			expect(res).to.have.status(404);
		});
	});

	describe('POST /doctor/getByEmail', () => {
		it('should return a doctor for a valid email', async () => {
			const res = await chai.request(app).post('/doctor/getByEmail').set('Authorization', `Bearer ${token}`).send({
				email: 'valid@email.com',
			});

			expect(res).to.have.status(200);
			expect(res.body).to.have.property('name');
		});

		it('should return a 404 for an invalid email', async () => {
			const res = await chai.request(app).post('/doctor/getByEmail').set('Authorization', `Bearer ${token}`).send({
				email: 'invalid@email.com',
			});
			expect(res).to.have.status(404);
		});
	});

	describe('POST /doctor/updateDoctor', () => {
		it('should update the doctor details', async () => {
			const res = await chai.request(app).post('/doctor/updateDoctor').set('Authorization', `Bearer ${token}`).send({
				name: 'Updated Doctor',
				email: 'valid@email.com',
				specialization: 'Dermatologist',
				clinic: 'Updated Hospital',
				location: 'Mumbai',
			});
			expect(res).to.have.status(200);
			expect(res.body.name).to.equal('Updated Doctor');
		});

		it('should return 404 for an invalid email', async () => {
			const res = await chai.request(app).post('/doctor/updateDoctor').set('Authorization', `Bearer ${token}`).send({
				name: 'Updated Doctor',
				email: 'invalid@email.com',
			});
			expect(res).to.have.status(404);
		});
	});

	after((done) => {
		setTimeout(() => done(), 1000);
	});
});
