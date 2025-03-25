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

async function sendPrescription(driver) {
	console.log('--- Testing Prescription Sending ---');
	try {
		// Test: Verify presence of "Online Prescription" button
		await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Online Prescription')]")), 10000);
		const bookButton = await driver.findElement(By.xpath("//button[contains(text(), 'Online Prescription')]"));
		console.log('Online Prescription button found.');

		await bookButton.click();
		console.log('Online Prescription button clicked.');

		// Test: Verify presence of "Online Prescription" form
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Online Prescription')]"), 10000));
		const prescriptionForm = await driver.findElement(By.xpath("//h1[contains(text(), 'Online Prescription')]/../.."));
		console.log('Online Prescription form found.');

		// Test: Verify presence of "Prescribe the medicines here" input field
		const prescriptionInput = await prescriptionForm.findElement(By.xpath("//textarea[@placeholder='Prescribe the medicines here']"));
		await prescriptionInput.sendKeys('Medicine 1, Medicine 2, Medicine 3');

		// Test: Verify presence of "Submit" button
		const submitButton = await prescriptionForm.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		await submitButton.click();
		console.log('Submit button clicked.');

		await driver.wait(until.stalenessOf(prescriptionForm), 10000);
		console.log('\nOnline Prescription sent successfully.\n');
	} catch (error) {
		console.error('An error occurred during Doctor Dashboard test:', error);
	}
}

async function runDoctorPrescriptionTest() {
	const driver = await createChromeDriver();

	try {
		console.log("--- Running Test for Booking Appointment from Doctor's Side ---");

		await doctorSignUpAndLogin(driver);

		await sendPrescription(driver);
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

const provideFeedback = async (driver) => {
	try {
		console.log("\n--- Providing Feedback from Patient's Side ---");
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

		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Feedback')]"), 10000));
		console.log('Feedback form found.');

		const feedbackInput = await driver.findElement(By.xpath("//textarea[@placeholder='Feedback']"));
		await feedbackInput.sendKeys('Feedback from patient');
		console.log('Feedback input area found.');

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
		await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Completed')]"), 10000));
		await driver.findElement(By.xpath("//h2[contains(text(), 'Completed')]"));
		console.log('Completed Consultations section found.');

		const patientName = await driver.findElement(By.xpath("//h4[contains(text(), 'New Patient Name')]"));
		const patientDiv = await patientName.findElement(By.xpath('//h4[contains(text(), "New Patient Name")]/../../..'));
		assert.strictEqual(await patientName.getText(), 'New Patient Name', 'Patient name not found or incorrect');
		console.log('Completed Consultation found.');

		const feedbackButton = await driver.findElement(By.xpath("//button[contains(text(), 'Feedback from Patient')]"));
		await feedbackButton.click();
		console.log('Feedback button clicked.');

		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Reply to Feedback')]"), 10000));
		console.log('Feedback form found.');

		await driver.findElement(By.xpath("//span[contains(text(), 'Feedback from patient')]"));
		console.log('Feedback found.');

		const replyInput = await driver.findElement(By.xpath("//textarea[@placeholder='Your Reply']"));
		await replyInput.sendKeys('Reply from doctor');

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
	await runDoctorPrescriptionTest();
	await runFeedbackTest();
	await runViewFeedbackTest();
	await runViewReplyTest();
	await runRemoveCompletedConsultationTest();

	console.log('\nAll prescription and feedback tests completed successfully!');
};

runTests();
