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

const { Builder, By, Key, until } = require('selenium-webdriver');
const { browserSize } = require('./config.json');
const { resizeWindow } = require('./helpers/setupHelper');
const { delay } = require('./helpers/generalHelpers');

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

const convertToScreenCoords = (coords) => {
	// console.log(coords);
	let { x, y } = coords;
	x = Math.round(x - 0.5 * browserSize.width);
	y = Math.round(y - 0.5 * browserSize.height);
	return { x, y };
};

const clickOnModel = async (driver, coords) => {
	const canvas = await driver.findElement(By.id('unityViewer'));
	await driver.wait(until.elementIsEnabled(canvas));

	const newCoords = convertToScreenCoords(coords);

	console.log(newCoords);

	await delay(10000);
	// console.log('{{{{{{{{{{{ ----- }}}}}}}}}}}');
	// eslint-disable-next-line no-underscore-dangle
	const cc = { x: 618 - 505, y: 291 - 349 };

	await driver.actions()
		.move({ ...cc, origin: canvas })
		.press()
		.release()
		.perform();

	// await new Promise((resolve) => setTimeout(resolve, 120000));
	await delay(10000);

	console.log('{{{{{{{{{{{ done }}}}}}}}}}}');

	await driver.wait(until.titleIs('Single cube - Viewer'), 6000);
};

(async function example() {
	const driver = await new Builder().forBrowser('chrome').build();

	try {
		// await driver.manage().window().setRect({ width: 500, height: 500 });
		await resizeWindow(driver, browserSize);
		await delay(2000);

		// await new Promise((resolve) => setTimeout(resolve, 2000));

		// await navigateTo3dRepo(driver);
		// await enterCredentials(driver, { username: 'teamSpace1', password: 'vdN5xQTQRY6syiD' });
		// await navigateToModelPage(driver, { teamspace: 'teamSpace1', project: '7b11d960-9b36-11ed-b559-0768f95e09ad', model: '8a49d120-a181-11ed-b5b4-45706a9895f2' });
		// await new Promise((resolve) => setTimeout(resolve, 3000));
		// await clickOnModel(driver, { x: 0.6118811881188119, y: 0.5 });
	} finally {
		await driver.quit();
	}
}());
