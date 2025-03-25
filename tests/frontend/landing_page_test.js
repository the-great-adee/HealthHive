const { Builder, By, Key, until } = require('selenium-webdriver');

async function createChromeDriver() {
	const driver = await new Builder().forBrowser('chrome').build();
	return driver;
}

async function runTests() {
	const driver = await createChromeDriver();

	try {
		console.log('--- Tests for Landing Page ---');

		// Open the landing page
		await driver.get('http://localhost:3000');

		// Doctor Tests
		console.log('\nDoctor Tests:');

		// Test case: Verify presence of "Log in As a Doctor" link and click it
		console.log('Test 1: Verifying presence of "Log in As a Doctor" link');
		const doctorLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Log in As a Doctor')]")), 10000);
		console.log('Result: Doctor login link found');
		console.log('Test 2: Clicking "Log in As a Doctor" link');
		await doctorLink.click();

		// Verify redirection to doctor login page
		const currentUrl = await driver.getCurrentUrl();
		if (currentUrl === 'http://localhost:3000/doctor-login') {
			console.log('Result: Redirected to Doctor login page successfully');
		} else {
			console.error('Result: Failed to redirect to Doctor login page');
		}

		await driver.navigate().back();

		// Patient Tests
		console.log('\nPatient Tests:');

		// Test case: Verify presence of "Log in As a Patient" link and click it
		console.log('Test 1: Verifying presence of "Log in As a Patient" link');
		const patientLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(text(), 'Log in As a Patient')]")), 10000);
		console.log('Result: Patient login link found');
		console.log('Test 2: Clicking "Log in As a Patient" link');
		await patientLink.click();

		// Verify redirection to patient login page
		const currentUrlAfterPatientClick = await driver.getCurrentUrl();
		if (currentUrlAfterPatientClick === 'http://localhost:3000/patient-login') {
			console.log('Result: Redirected to Patient login page successfully');
		} else {
			console.error('Result: Failed to redirect to Patient login page');
		}

		console.log('\nAll landing page tests completed successfully!');
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

runTests();
