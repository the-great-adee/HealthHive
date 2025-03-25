const { Builder, By, Key, until, Select } = require('selenium-webdriver');
const assert = require('assert');

async function createChromeDriver() {
	let driver = await new Builder().forBrowser('chrome').build();
	return driver;
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

async function testDoctorDashboard(driver) {
	console.log('--- Testing Doctor Dashboard ---');
	try {
		await driver.wait(until.elementLocated(By.css('h2')), 10000);
		const headings = await driver.findElements(By.css('h2'));
		// Test: Verify presence of "PENDING CONSULTATIONS" section
		assert.strictEqual(await headings[0].getText(), 'PENDING CONSULTATIONS', 'Heading not found or incorrect');
		console.log('Pending Consultations section found.');

		// Test: Verify presence of "BOOKED APPOINTMENTS" section
		assert.strictEqual(await headings[1].getText(), 'BOOKED APPOINTMENTS', 'Heading not found or incorrect');
		console.log('Booked Appointments section found.');

		// Test: Verify presence of "COMPLETED" section
		assert.strictEqual(await headings[2].getText(), 'COMPLETED', 'Heading not found or incorrect');
		console.log('Completed section found.');
	} catch (error) {
		console.error('An error occurred during Doctor Dashboard test:', error);
	}
}

async function testUpdateProfile(driver) {
	console.log('\n--- Testing Update Profile ---');
	try {
		// Test: Verify presence of "Name" input field
		await driver.wait(until.elementLocated(By.id('name')), 10000);
		console.log('Entering new name...');
		await driver.findElement(By.id('name')).clear();
		await driver.findElement(By.id('name')).sendKeys('New Doctor Name');

		// Test: Verify presence of "Specialisation" input field
		console.log('Entering new specialisation...');
		await driver.wait(until.elementLocated(By.id('specialisation')), 10000);
		await driver.findElement(By.id('specialisation')).clear();
		await driver.findElement(By.id('specialisation')).sendKeys('New Doctor Specialisation');

		// Test: Verify presence of "Certification" input field
		console.log('Entering new certification...');
		await driver.wait(until.elementLocated(By.id('certification')), 10000);
		await driver.findElement(By.id('certification')).clear();
		await driver.findElement(By.id('certification')).sendKeys('New Doctor Certification');

		// Test: Verify presence of "Clinic" input field
		console.log('Entering new clinic...');
		await driver.wait(until.elementLocated(By.id('clinic')), 10000);
		await driver.findElement(By.id('clinic')).clear();
		await driver.findElement(By.id('clinic')).sendKeys('New Doctor Clinic');

		// Test: Verify presence of "Working Hours" input fields
		console.log('Setting working hours...');
		const monday_from = await driver.findElement(By.id('monday-from'));
		await monday_from.clear();
		await monday_from.sendKeys('09:00');

		const monday_to = await driver.findElement(By.id('monday-to'));
		await monday_to.clear();
		await monday_to.sendKeys('17:00');

		// Test: Verify presence of "Location" select dropdown
		console.log('Selecting location...');
		const selectElement = await driver.findElement(By.id('countries'));
		const select = new Select(selectElement);
		await select.selectByVisibleText('Bangalore');

		// Test: Verify presence of "Submit" button
		console.log('Submitting the form...');
		await driver.findElement(By.css('button[type="submit"]')).click();

		await driver.wait(until.urlIs('http://localhost:3000/doctor-dashboard'), 5000);

		console.log('Update Profile test completed successfully!');
	} catch (error) {
		console.error('An error occurred during Update Profile test:', error);
	}
}

async function viewIncomingConsultation(driver) {
	console.log('\n--- Viewing Incoming Consultation ---');
	try {
		// Test: Verify presence of "New Patient Name" in the list of consultations
		await driver.wait(until.elementLocated(By.xpath("//h4[contains(text(), 'New Patient Name')]")), 10000);
		const patientDiv = await driver.findElement(By.xpath("//h4[contains(text(), 'New Patient Name')]/../../.."));
		console.log('Incoming consultation from test patient found.\n');

		// Test: Verify presence of "Online Prescription" button
		await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Online Prescription')]")), 10000);
		const prescriptionButton = await patientDiv.findElement(By.xpath("//button[contains(text(), 'Online Prescription')]"));
		console.log('Prescription button found.');
		await prescriptionButton.click();

		// Test: Verify display of "Online Prescription" form on clicking the button
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Online Prescription')]")), 10000);
		const prescriptionForm = await driver.findElement(By.xpath("//h1[contains(text(), 'Online Prescription')]/.."));
		console.log('Online Prescription form found.');

		await driver.wait(until.elementLocated(By.xpath("//textarea[@placeholder='Prescribe the medicines here']")), 10000);
		console.log('Prescription input area found.');

		const crossButton2 = await prescriptionForm.findElement(By.className(' hover:bg-gray-100 transition-all rounded'));
		await crossButton2.click();
		console.log('Cross button clicked.');

		await driver.wait(until.stalenessOf(prescriptionForm), 10000);
		console.log('Online Prescription form closed.\n');

		// Test: Verify presence of "Book Appointment" button
		await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Book Appointment')]")), 10000);
		const bookButton = await patientDiv.findElement(By.xpath("//button[contains(text(), 'Book Appointment')]"));
		console.log('Book Appointment button found.');

		await bookButton.click();
		console.log('Book Appointment button clicked.');

		// Test: Verify display of "Book Appointment" form on clicking the button
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Book Appointment')]"), 10000));
		const appointmentForm = await driver.findElement(By.xpath("//h1[contains(text(), 'Book Appointment')]/.."));
		console.log('Book Appointment form found.');

		await driver.wait(until.elementLocated(By.id('date')), 10000);
		console.log('Date input area found.');

		await driver.wait(until.elementLocated(By.id('time')), 10000);
		console.log('Time input area found.');

		const crossButton3 = await appointmentForm.findElement(By.className(' hover:bg-gray-100 transition-all rounded'));
		await crossButton3.click();
		console.log('Cross button clicked.');

		await driver.wait(until.stalenessOf(appointmentForm), 10000);
		console.log('Book Appointment form closed.\n');

		// Test: Verify presence of "Reject" button
		const rejectButton = await patientDiv.findElement(By.xpath("//button[contains(text(), 'Reject')]"));
		console.log('Reject button found.');
		await rejectButton.click();

		// Test: Verify display of "Reject Consultation" form on clicking the button
		await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Reject Consultation')]")), 10000);
		const rejectForm = await driver.findElement(By.xpath("//h1[contains(text(), 'Reject Consultation')]/../.."));
		console.log('Reject Consultation form found.');

		await driver.wait(until.elementLocated(By.xpath("//textarea[@placeholder='Reasons for rejection']")), 10000);
		const rejectInput = await driver.findElement(By.xpath("//textarea[@placeholder='Reasons for rejection']"));
		rejectInput.sendKeys('Reasons for rejection');
		console.log('Reasons for rejection input area found.');

		const submitButton = await rejectForm.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		submitButton.click();
		console.log('Submit button clicked.');

		await driver.wait(until.stalenessOf(rejectForm), 10000);
		console.log('Reject Consultation form closed.\n');

		console.log('Incoming Consultation test completed successfully!');
	} catch (error) {
		console.error('An error occurred during Incoming Consultation test:', error);
	}
}

async function runTests() {
	const driver = await createChromeDriver();

	try {
		console.log('--- Running Tests for Doctor Dashboard and Update Profile ---');

		await doctorSignUpAndLogin(driver);

		await testDoctorDashboard(driver);

		const editProfileButton = await driver.findElement(By.xpath("//button[contains(text(), 'Edit Profile')]"));
		console.log('\nEdit Profile button found.');
		await editProfileButton.click();

		await testUpdateProfile(driver);

		await viewIncomingConsultation(driver);

		console.log('\nDoctor Dashboard tests completed successfully!');
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

runTests();
