const { Builder, By, Key, until } = require('selenium-webdriver');

async function createChromeDriver() {
	const driver = await new Builder().forBrowser('chrome').build();
	return driver;
}

async function runTests() {
	const driver = await createChromeDriver();

	try {
		console.log('--- Tests for Login Page ---');

		// Test for Doctor Login Page
		console.log('Testing Doctor Login Page:');
		await testLoginPage(driver, '/doctor-login');

		// Test for Patient Login Page
		console.log('\nTesting Patient Login Page:');
		await testLoginPage(driver, '/patient-login');
	} catch (error) {
		console.error('An error occurred:', error);
	} finally {
		await driver.quit();
	}
}

async function testLoginPage(driver, route) {
	await driver.get(`http://localhost:3000${route}`);

	const pageTitle = await driver.findElement(By.xpath("//h2[contains(@class, 'text-2xl')]")).getText();
	console.log(`Page Title: ${pageTitle}`);

	// Test case: Verify presence of "Email" input field
	const emailInput = await driver.findElement(By.id('email'));
	console.log('Result: Email input field found');

	// Test case: Verify presence of "Password" input field
	const passwordInput = await driver.findElement(By.id('password'));
	console.log('Result: Password input field found');

	// Test case: Verify presence of "Log in" button
	const loginButton = await driver.findElement(By.xpath("//button[contains(text(), 'Log in')]"));
	console.log('Result: Log in button found');

	// Test case: Verify presence of "Not a member?" text
	const notMemberText = await driver.findElement(By.xpath("//p[contains(text(), 'Not a member?')]"));
	console.log('Result: "Not a member?" text found');

	// Test case: Verify presence of "Sign up" link
	const signUpLink = await driver.findElement(By.linkText('Sign up'));
	console.log('Result: "Sign up" link found');

	// Test case: Verify presence of "Show Password" checkbox
	const showPasswordCheckbox = await driver.findElement(By.id('showPassword'));
	console.log('Result: "Show Password" checkbox found');

	console.log('\nAll tests for Login Page completed successfully!');
}

runTests();
