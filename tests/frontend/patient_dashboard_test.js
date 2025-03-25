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

async function testPatientDashboard(driver) {
	console.log('--- Testing Patient Dashboard ---');
	try {
		await driver.wait(until.elementLocated(By.css('h2')), 10000);
		const headings = await driver.findElements(By.css('h2'));
		// Test: Verify presence of "LIST OF AVAILABLE DOCTORS" section
		assert.strictEqual(await headings[0].getText(), 'LIST OF AVAILABLE DOCTORS', 'Heading not found or incorrect');
		console.log('List of Doctors section found.');

		// Test: Verify presence of Location Dropdown
		await driver.wait(until.elementLocated(By.id('countries')), 10000);
		console.log('Location select dropdown found.');

		// Test: Verify presence of "YOUR CONSULTATIONS" button
		await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Your Consultations')]")), 10000);
		console.log('Your Consultations button found.');

		console.log('Patient Dashboard test completed successfully!');
	} catch (error) {
		console.error('An error occurred during Patient Dashboard test:', error);
	}
}

async function testUpdateProfile(driver) {
	console.log('\n--- Testing Update Profile ---');
	try {
		// Test: Verify presence of "Name" input field
		await driver.wait(until.elementLocated(By.id('name')), 10000);
		console.log('Entering new name...');
		await driver.findElement(By.id('name')).clear();
		await driver.findElement(By.id('name')).sendKeys('New Patient Name');

		// Test: Verify presence of "Age" input field
		await driver.wait(until.elementLocated(By.id('age')), 10000);
		console.log('Entering new age...');
		await driver.findElement(By.id('age')).clear();
		await driver.findElement(By.id('age')).sendKeys('25');

		// Test: Verify presence of "Location" dropdown
		console.log('Selecting location...');
		const selectElement = await driver.findElement(By.id('countries'));
		const select = new Select(selectElement);
		await select.selectByVisibleText('Bangalore');

		// Test: Verify presence of "Submit" button
		console.log('Submitting the form...');
		await driver.findElement(By.css('button[type="submit"]')).click();

		await driver.wait(until.urlIs('http://localhost:3000/patient-dashboard'), 5000);

		console.log('Update Profile test completed successfully!');
	} catch (error) {
		console.error('An error occurred during Update Profile test:', error);
	}
}

async function clickBookButton(driver) {
	try {
		console.log('\n--- Testing consultation booking ---');
		await driver.wait(until.elementLocated(By.xpath("//h4[contains(text(), 'New Doctor Specialisation')]")), 10000);
		const parentDiv = await driver.findElement(By.xpath("//h4[contains(text(), 'New Doctor Specialisation')]/.."));
		const bookButton = await parentDiv.findElement(By.xpath(".//button[contains(text(), 'Book')]"));
		await bookButton.click();
		console.log('Book button clicked.');

		// Test: Verify presence of Consultation Form
		const formHeading = await driver.findElement(By.xpath("//h1[contains(text(), 'Consultation Form')]"), 10000);
		assert.strictEqual(await formHeading.getText(), 'Consultation Form', 'Consultation form not found or incorrect');
		console.log('Consultation form found.');

		// Test: Verify presence of Symptoms input field
		console.log('Entering symptoms...');
		const symptomsBox = await driver.findElement(By.xpath("//textarea[@placeholder='List your symptoms separated by commas']"));
		await symptomsBox.sendKeys('Fever, Cough, Headache');

		// Test: Verify presence of Submit button
		const submitButton = await driver.findElement(By.xpath("//button[contains(text(), 'Submit')]"));
		await submitButton.click();
		console.log('Submit button clicked.');

		await driver.wait(until.stalenessOf(formHeading), 10000);
		console.log('Consultation form no longer rendered.');
	} catch (error) {
		console.error('An error occurred while clicking the book button:', error);
	}
}

async function viewPendingConsultation(driver) {
	try {
		console.log('\n--- Viewing pending consultation ---');
		await driver.executeScript('window.scrollTo(0, 0);');

		// Test: Verify presence of "Your Consultations" button
		await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Your Consultations')]"), 10000));
		const consultationsButton = await driver.findElement(By.xpath("//a[contains(text(), 'Your Consultations')]"));
		await consultationsButton.click();
		console.log('Your Consultations button clicked.');

		// Test: Verify presence of "Pending Consultations" section
		await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Pending Consultations')]"), 10000));
		console.log('Pending Consultations section found.');

		// Test: Verify presence of "New Doctor Name" in the list of pending consultations
		const doctorName = await driver.findElement(By.xpath("//td[contains(text(), 'New Doctor Name')]"));
		assert.strictEqual(await doctorName.getText(), 'New Doctor Name', 'Doctor name not found or incorrect');
		console.log('Doctor name found.');

		console.log('View pending consultation test completed successfully!');
	} catch (error) {
		console.error('An error occurred while viewing pending consultation:', error);
	}
}

async function runTests() {
	const driver = await createChromeDriver();

	try {
		console.log('--- Running Tests for Patient Dashboard, Update Profile and Consultation Booking ---');

		await patientSignUpAndLogin(driver);

		await testPatientDashboard(driver);

		const editProfileButton = await driver.findElement(By.xpath("//button[contains(text(), 'Edit Profile')]"));
		console.log('\nEdit Profile button found.');
		await editProfileButton.click();

		await testUpdateProfile(driver);

		await clickBookButton(driver);

		await viewPendingConsultation(driver);

		console.log('\nPatient Dashboard tests completed successfully!');
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

runTests();
