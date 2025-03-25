const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../../backend/server');
const mongoose = require('mongoose');
const Patient = require('../../backend/Database/Models/Patient');

chai.use(chaiHttp);
const expect = chai.expect;

describe('Patient API Tests', () => {
	before(async () => {
		if (mongoose.connection.readyState === 0) {
			await mongoose.connect('mongodb://localhost:27017/omcs-test', {});
			console.log('Database connected and up at port 27017!');
		}

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await Patient.deleteMany({});
	});

	after(async () => {
		await mongoose.disconnect();
	});

	let token = '';

	describe('POST /patient/createPatient', () => {
		it('should create a new patient', async () => {
			const res = await chai.request(app).post('/patient/createPatient').send({
				name: 'Test Patient',
				email: 'valid@email.com',
				password: 'password123',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('token');
			token = res.body.token;
		});

		it('should not allow creating a patient with an existing email', async () => {
			const res = await chai.request(app).post('/patient/createPatient').send({
				name: 'Test Patient',
				email: 'valid@email.com',
			});
			expect(res.status).to.equal(400);
		});
	});

	describe('POST /patient/loginPatient', () => {
		it('should login a patient', async () => {
			const res = await chai.request(app).post('/patient/loginPatient').send({
				email: 'valid@email.com',
				password: 'password123',
			});
			expect(res.status).to.equal(200);
			expect(res.body).to.have.property('token');
			token = res.body.token;
		});

		it('should return 404 for an invalid email', async () => {
			const res = await chai.request(app).post('/patient/loginPatient').send({
				email: 'invalid@email.com',
				password: 'password123',
			});

			expect(res).to.have.status(404);
		});

		it('should return 400 for an invalid password', async () => {
			const res = await chai.request(app).post('/patient/loginPatient').send({
				email: 'valid@email.com',
				password: 'invalidpassword',
			});

			expect(res).to.have.status(400);
		});
	});

	describe('POST /patient/getPatientsByIds', () => {
		it('should return patients by ids', async () => {
			const patient = await Patient.findOne({ email: 'valid@email.com' });
			const res = await chai
				.request(app)
				.post('/patient/getPatientsByIds')
				.set('Authorization', `Bearer ${token}`)
				.send({
					ids: [patient._id],
				});

			expect(res).to.have.status(200);
			expect(res.body).to.be.an('array');
			expect(res.body[0]).to.have.property('name');
		});

		it('should return 404 for invalid ids', async () => {
			const invalidId = new mongoose.Types.ObjectId().toString();
			const res = await chai
				.request(app)
				.post('/patient/getPatientsByIds')
				.set('Authorization', `Bearer ${token}`)
				.send({
					ids: [invalidId],
				});
			expect(res).to.have.status(404);
		});
	});

	describe('POST /patient/getByEmail', () => {
		it('should return a patient by email', async () => {
			const res = await chai.request(app).post('/patient/getByEmail').set('Authorization', `Bearer ${token}`).send({
				email: 'valid@email.com',
			});

			expect(res).to.have.status(200);
			expect(res.body).to.have.property('name');
		});

		it('should return 404 for an invalid email', async () => {
			const res = await chai.request(app).post('/patient/getByEmail').set('Authorization', `Bearer ${token}`).send({
				email: 'invalidemail',
			});

			expect(res).to.have.status(404);
		});
	});

	describe('POST /patient/updatePatient', () => {
		it('should update a patient', async () => {
			const res = await chai.request(app).post('/patient/updatePatient').set('Authorization', `Bearer ${token}`).send({
				name: 'Updated Name',
				email: 'valid@email.com',
				age: 25,
				location: 'Bangalore',
			});

			expect(res).to.have.status(200);
			expect(res.body).to.have.property('name');
		}),
			it('should return 404 for an invalid email', async () => {
				const res = await chai.request(app).post('/patient/updatePatient').set('Authorization', `Bearer ${token}`).send({
					name: 'Updated Name',
					email: 'invalidemail',
					age: 25,
					location: 'Bangalore',
				});

				expect(res).to.have.status(404);
			});
	});
});
