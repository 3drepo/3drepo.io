/**
 *  Copyright (C) 2023 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/* eslint-disable import/no-extraneous-dependencies */

const { Builder, By, Key, until, Actions } = require('selenium-webdriver');
// const { input } = require('selenium-webdriver/lib');

const navigateTo3dRepo = async (driver) => {
	await driver.get('https://3drepo.lan/');
	await driver.wait(until.titleIs('Log in'), 100000);
};

const enterCredentials = async (driver, { username, password }) => {
	const usernameInput = await driver.findElement(By.name('username'));
	await driver.wait(until.elementIsEnabled(usernameInput));
	usernameInput.sendKeys(username);
	const passwordInput = await driver.findElement(By.name('password'));
	await driver.wait(until.elementIsEnabled(passwordInput));
	passwordInput.sendKeys(password);
	const loginButton = await driver.findElement(By.xpath("//button[contains(text(),'Log in')]"));
	await driver.wait(until.elementIsEnabled(loginButton));
	loginButton.click();
	await driver.wait(until.urlContains('dashboard'), 100000);
};

const navigateToModelPage = async (driver, { teamspace, project, model }) => {
	await driver.get(`https://3drepo.lan/v5/viewer/${teamspace}/${project}/${model}`);
	// await driver.wait(until.titleIs('watevs'), 100000);
};

const clickOnModel = async (driver) => {
	const canvas = await driver.findElement(By.id('unityViewer'));
	await driver.wait(until.elementIsEnabled(canvas));

	await new Promise((resolve) => setTimeout(resolve, 15000));

	console.log('{{{{{{{{{{{ ----- }}}}}}}}}}}');

	// eslint-disable-next-line no-underscore-dangle
	await driver.actions()
		.move({ x: 400, y: 300, origin: canvas })
		.press()
		.release()
		.perform();

	await new Promise((resolve) => setTimeout(resolve, 3000));

	console.log('{{{{{{{{{{{ done }}}}}}}}}}}');

	await driver.wait(until.titleIs('Single cube - Viewer'), 1000);
};

(async function example() {
	const driver = await new Builder().forBrowser('chrome').build();

	try {
		await driver.get('https://webglfundamentals.org/webgl/webgl-picking-w-gpu.html');
		const canvas = await driver.findElement(By.xpath('//canvas'));
		await driver.wait(until.elementIsEnabled(canvas));

		await new Promise((resolve) => setTimeout(resolve, 1000));
		console.log('{{{{{{{{{{{ ----- }}}}}}}}}}}');
		// eslint-disable-next-line no-underscore-dangle
		await driver.actions()
			.move({ x: -100, y: -75, origin: canvas })
			.perform();

		await new Promise((resolve) => setTimeout(resolve, 3000));

		await driver.actions()
			.move({ x: 0, y: 0, origin: canvas })
			.perform();

		await new Promise((resolve) => setTimeout(resolve, 2000));

		// await driver.get('http://www.google.com/ncr');
		// const acceptButton = await driver.findElement(By.xpath("//div[text()='Accept all']"));
		// acceptButton.click();
		// const elem = await driver.findElement(By.name('q'));
		// driver.wait(until.elementIsEnabled(elem));
		// elem.sendKeys('webdriver', Key.RETURN);
		// await driver.wait(until.titleIs('Single cube  - Viewer'), 1000);

		// await navigateTo3dRepo(driver);
		// await enterCredentials(driver, { username: 'teamSpace1', password: 'vdN5xQTQRY6syiD' });
		// await navigateToModelPage(driver, { teamspace: 'teamSpace1', project: '7b11d960-9b36-11ed-b559-0768f95e09ad', model: '8a49d120-a181-11ed-b5b4-45706a9895f2' });
		// await new Promise((resolve) => setTimeout(resolve, 10000));
		// await clickOnModel(driver);
	} finally {
		await driver.quit();
	}
}());
