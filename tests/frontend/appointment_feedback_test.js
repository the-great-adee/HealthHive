const { Builder, By, Key, until, Select } = require('selenium-webdriver');
const assert = require('assert');

async function createChromeDriver() {
	let driver = await new Builder().forBrowser('chrome').build();
	return driver;
}

async function patientSignUpAndLogin(driver) {
	console.log('\n--- Performing Patient Sign Up and Login ---');
	await driver.get('http://localhost:3000/patient-login');

	console.log('Logging in as a patient...');
	await driver.findElement(By.id('email')).sendKeys('test_patient_email@example.com');
	await driver.findElement(By.id('password')).sendKeys('Abcd@123', Key.RETURN);

	await driver.wait(until.urlIs('http://localhost:3000/patient-dashboard'), 5000);
	console.log('Patient Sign Up and Login Successful!\n');
}

async function clickBookButton(driver) {
	try {
		console.log('\n--- Testing consultation booking ---');
		await driver.wait(until.elementLocated(By.xpath("//h4[contains(text(), 'New Doctor Specialisation')]")), 10000);
		const parentDiv = await driver.findElement(By.xpath("//h4[contains(text(), 'New Doctor Specialisation')]/.."));
		const bookButton = await parentDiv.findElement(By.xpath(".//button[contains(text(), 'Book')]"));
		await bookButton.click();
		console.log('Book button clicked.');

		const formHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Consultation Form')]"), 10000);
		assert.strictEqual(await formHeading.getText(), 'Consultation Form', 'Consultation form not found or incorrect');
		console.log('Consultation form found.');

		console.log('Entering symptoms...');
		const symptomsBox = await driver.findElement(By.xpath("//textarea[@placeholder='List your symptoms separated by commas']"));
		await symptomsBox.sendKeys('Fever, Cough, Headache');

		const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		await submitButton.click();
		console.log('Submit button clicked.');

		await driver.wait(until.stalenessOf(formHeading), 10000);
		console.log('Consultation form no longer rendered.');
	} catch (error) {
		console.error('An error occurred while clicking the book button:', error);
	}
}

async function runPatientConsultationTest() {
	const driver = await createChromeDriver();

	try {
		console.log("--- Running Test for Booking Consultation from Patient's Side ---");

		await patientSignUpAndLogin(driver);

		await clickBookButton(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

async function doctorSignUpAndLogin(driver) {
	console.log('\n--- Performing Doctor Sign Up and Login ---');
	await driver.get('http://localhost:3000/doctor-login');

	console.log('Logging in as a doctor...');
	await driver.findElement(By.id('email')).sendKeys('your_doctor_email@example.com');
	await driver.findElement(By.id('password')).sendKeys('Abcd@123', Key.RETURN);

	await driver.wait(until.urlIs('http://localhost:3000/doctor-dashboard'), 5000);
	console.log('Doctor Sign Up and Login Successful!\n');
}

async function bookAppointment(driver) {
	console.log('--- Testing Appointment Booking ---');
	try {
		// Test: Verify presence of "Book Appointment" button
		await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Book Appointment')]")), 10000);
		const bookButton = await driver.findElement(By.xpath("//button[contains(text(), 'Book Appointment')]"));
		console.log('Book Appointment button found.');

		await bookButton.click();
		console.log('Book Appointment button clicked.');

		// Test: Verify presence of "Book Appointment" form
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Book Appointment')]"), 10000));
		const appointmentForm = await driver.findElement(By.xpath("//h1[contains(text(), 'Book Appointment')]/../.."));
		console.log('Book Appointment form found.');

		// Test: Verify presence of "Date" input field
		await driver.wait(until.elementLocated(By.id('date')), 10000);
		console.log('Date input area found.');
		console.log('Entering date...');
		await driver.findElement(By.id('date')).sendKeys('15-04-2024');

		// Test: Verify presence of "Time" input field
		await driver.wait(until.elementLocated(By.id('time')), 10000);
		console.log('Time input area found.');
		console.log('Entering time...');
		await driver.findElement(By.id('time')).sendKeys('10:00');

		// Test: Verify presence of "Submit" button
		const submitButton = await appointmentForm.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		await submitButton.click();
		console.log('Submit button clicked.');

		await driver.wait(until.stalenessOf(appointmentForm), 10000);
		console.log('\nAppointment Booking submitted successfully.\n');
	} catch (error) {
		console.error('An error occurred during Doctor Dashboard test:', error);
	}
}

async function runDoctorAppointmentTest() {
	const driver = await createChromeDriver();

	try {
		console.log("--- Running Test for Booking Appointment from Doctor's Side ---");

		await doctorSignUpAndLogin(driver);

		await bookAppointment(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

const viewAppointmentDetails = async (driver) => {
	try {
		console.log('\n--- Viewing Appointment Details ---');
		await driver.executeScript('window.scrollTo(0, 0);');
		await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Your Consultations')]"), 10000));
		const consultationsButton = await driver.findElement(By.xpath("//a[contains(text(), 'Your Consultations')]"));
		await consultationsButton.click();
		console.log('Your Consultations button clicked.');

		// Test: Verify presence of "Booked Appointments" section
		await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Booked Appointments')]"), 10000));
		console.log('Booked Appointments section found.');

		// Test: Verify presence of "New Doctor Name" in the list of booked appointments
		const doctorName = await driver.findElement(By.xpath("//td[contains(text(), 'New Doctor Name')]"));
		assert.strictEqual(await doctorName.getText(), 'New Doctor Name', 'Doctor name not found or incorrect');
		console.log('Appointment found.');

		// Test: Verify presence of "Date" of the appointment
		const date = await driver.findElement(By.xpath("//td[contains(text(), '2024-04-15')]"));
		assert.strictEqual(await date.getText(), '2024-04-15', 'Date not found or incorrect');
		console.log('Date found.');

		// Test: Verify presence of "Time" of the appointment
		const time = await driver.findElement(By.xpath("//td[contains(text(), '10:00')]"));
		assert.strictEqual(await time.getText(), '10:00', 'Time not found or incorrect');
		console.log('Time found.');

		console.log('Booked Appointment viewed successfully!');
	} catch (error) {
		console.error('An error occurred while viewing pending consultation:', error);
	}
};

const runPatientAppointmentTest = async () => {
	const driver = await createChromeDriver();

	try {
		console.log("--- Running Tests for Appointment Viewing on Patient's Side ---");
		await patientSignUpAndLogin(driver);
		await viewAppointmentDetails(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
};

const completeAppointmentTest = async (driver) => {
	try {
		console.log('\n--- Completing Appointment ---');

		// Test: Verify presence of "Completed" button
		await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Completed')]"), 10000));
		await driver.findElement(By.xpath("//button[contains(text(), 'Completed')]")).click();
		console.log('Completed button clicked.');

		// Test: Verify presence of "Feedback from Patient" button
		await driver.wait(until.elementLocated(By.xpath("//Button[contains(text(), 'Feedback from Patient')]"), 10000));
		console.log('Feedback button found.');

		console.log('Appointment completed successfully!');
	} catch (error) {
		console.error('An error occurred while completing appointment:', error);
	}
};

const runAppointmentCompletionTest = async () => {
	const driver = await createChromeDriver();
	try {
		console.log("--- Running Tests for Completing Appointment from Doctor's Side ---");
		await doctorSignUpAndLogin(driver);
		await completeAppointmentTest(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
};

const provideFeedback = async (driver) => {
	try {
		console.log("\n--- Providing Feedback from Patient's Side ---");
		await driver.executeScript('window.scrollTo(0, 0);');

		// Test: Verify presence of "Your Consultations" button
		await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Your Consultations')]"), 10000));
		const consultationsButton = await driver.findElement(By.xpath("//a[contains(text(), 'Your Consultations')]"));
		await consultationsButton.click();
		console.log('Your Consultations button clicked.');

		// Test: Verify presence of "Completed Consultations" section
		await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Completed Consultations')]"), 10000));
		console.log('Completed Consultations section found.');

		// Test: Verify presence of "New Doctor Name" in the list of completed consultations
		const doctorName = await driver.findElement(By.xpath("//td[contains(text(), 'New Doctor Name')]"));
		assert.strictEqual(await doctorName.getText(), 'New Doctor Name', 'Doctor name not found or incorrect');
		console.log('Completed Consultation found.');

		// Test: Verify presence of "Feedback" button
		const feedbackButton = await driver.findElement(By.xpath("//button[contains(text(), 'Feedback')]"));
		await feedbackButton.click();
		console.log('Feedback button clicked.');

		// Test: Verify presence of "Feedback" form
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Feedback')]"), 10000));
		console.log('Feedback form found.');

		// Test: Verify presence of "Feedback" input field
		const feedbackInput = await driver.findElement(By.xpath("//textarea[@placeholder='Feedback']"));
		await feedbackInput.sendKeys('Feedback from patient');
		console.log('Feedback input area found.');

		// Test: Verify presence of "Submit" button
		const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		await submitButton.click();

		await driver.wait(until.stalenessOf(feedbackInput), 10000);
		console.log('Feedback submitted successfully!');
	} catch (error) {
		console.error('An error occurred while viewing pending consultation:', error);
	}
};

const runFeedbackTest = async () => {
	const driver = await createChromeDriver();
	try {
		console.log("--- Running Tests for Providing Feedback from Patient's Side ---");
		await patientSignUpAndLogin(driver);
		await provideFeedback(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
};

const viewFeedback = async (driver) => {
	try {
		console.log("\n--- Viewing Feedback on Doctor's Side ---");

		// Test: Verify presence of "Completed Consultations" section
		await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Completed')]"), 10000));
		await driver.findElement(By.xpath("//h2[contains(text(), 'Completed')]"));
		console.log('Completed Consultations section found.');

		// Test: Verify presence of "New Patient Name" in the list of completed consultations
		const patientName = await driver.findElement(By.xpath("//h4[contains(text(), 'New Patient Name')]"));
		assert.strictEqual(await patientName.getText(), 'New Patient Name', 'Patient name not found or incorrect');
		console.log('Completed Consultation found.');

		// Test: Verify presence of "Feedback from Patient" button
		const feedbackButton = await driver.findElement(By.xpath("//button[contains(text(), 'Feedback from Patient')]"));
		await feedbackButton.click();
		console.log('Feedback button clicked.');

		// Test: Verify presence of "Feedback" form
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Reply to Feedback')]"), 10000));
		console.log('Feedback form found.');

		// Test: Verify presence of "Feedback from patient"
		await driver.findElement(By.xpath("//span[contains(text(), 'Feedback from patient')]"));
		console.log('Feedback found.');

		// Test: Verify presence of "Reply" input field
		const replyInput = await driver.findElement(By.xpath("//textarea[@placeholder='Your Reply']"));
		await replyInput.sendKeys('Reply from doctor');

		// Test: Verify presence of "Submit" button
		const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		await submitButton.click();

		await driver.wait(until.stalenessOf(replyInput), 10000);
		console.log('Feedback replied successfully!');
	} catch (error) {
		console.error('An error occurred while viewing pending consultation:', error);
	}
};

const runViewFeedbackTest = async () => {
	const driver = await createChromeDriver();
	try {
		console.log("--- Running Tests for Viewing Feedback from Doctor's Side ---");
		await doctorSignUpAndLogin(driver);
		await viewFeedback(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
};

const viewReply = async (driver) => {
	try {
		console.log('\n--- Viewing Reply from Doctor ---');
		await driver.executeScript('window.scrollTo(0, 0);');
		await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Your Consultations')]"), 10000));
		const consultationsButton = await driver.findElement(By.xpath("//a[contains(text(), 'Your Consultations')]"));
		await consultationsButton.click();
		console.log('Your Consultations button clicked.');

		await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Completed Consultations')]"), 10000));
		console.log('Completed Consultations section found.');

		const doctorName = await driver.findElement(By.xpath("//td[contains(text(), 'New Doctor Name')]"));
		assert.strictEqual(await doctorName.getText(), 'New Doctor Name', 'Doctor name not found or incorrect');
		console.log('Completed Consultation found.');

		const feedbackButton = await driver.findElement(By.xpath("//button[contains(text(), 'Feedback')]"));
		await feedbackButton.click();
		console.log('Feedback button clicked.');

		// Test: Verify presence of "Reply from doctor"
		await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'Reply from doctor')]"), 10000));
		console.log('Reply from doctor found.');
	} catch (error) {
		console.error('An error occurred while viewing pending consultation:', error);
	}
};

const runViewReplyTest = async () => {
	const driver = await createChromeDriver();
	try {
		console.log("--- Running Tests for Viewing Reply from Patient's Side ---");
		await patientSignUpAndLogin(driver);
		await viewReply(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
};

const removeCompletedConsultation = async (driver) => {
	try {
		console.log('\n--- Removing Completed Consultation ---');

		// Test: Verify presence of "Remove" button
		await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Remove')]"), 10000));
		await driver.findElement(By.xpath("//button[contains(text(), 'Remove')]")).click();
		console.log('Remove button clicked.');

		await driver.wait(until.stalenessOf(driver.findElement(By.xpath("//button[contains(text(), 'Remove')]")), 10000));
		console.log('Completed Consultation removed successfully!');
	} catch (error) {
		console.error('An error occurred while removing completed consultation:', error);
	}
};

const runRemoveCompletedConsultationTest = async () => {
	const driver = await createChromeDriver();
	try {
		console.log("--- Running Tests for Removing Completed Consultation from Patient's Side ---");
		await doctorSignUpAndLogin(driver);
		await removeCompletedConsultation(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
};

const runTests = async () => {
	await runPatientConsultationTest();
	await runDoctorAppointmentTest();
	await runPatientAppointmentTest();
	await runAppointmentCompletionTest();
	await runFeedbackTest();
	await runViewFeedbackTest();
	await runViewReplyTest();
	await runRemoveCompletedConsultationTest();

	console.log('\nAll appointment and feedback tests completed successfully!');
};

runTests();
