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


const navigateTo3dRepo = async (driver) => {
	await driver.get('https://3drepo.lan/');
	await driver.wait(until.titleIs('Log in'), 100000);
};

const enterCredentials = async (driver, { username, password }) => {
	const usernameInput = await driver.findElement(By.name('username'));
	const passwordInput = await driver.findElement(By.name('password'));
	await driver.wait(until.elementIsEnabled(usernameInput));
	usernameInput.sendKeys(username);
	await driver.wait(until.elementIsEnabled(passwordInput));
	passwordInput.sendKeys(password);
	const loginButton = await driver.findElement(By.xpath("//button[contains(text(),'Log in')]"));
	await driver.wait(until.elementIsEnabled(loginButton));

	loginButton.click();
};

(async function example() {
	const driver = await new Builder().forBrowser('chrome').build();
	try {
		// await driver.get('http://www.google.com/ncr');
		// const acceptButton = await driver.findElement(By.xpath("//div[text()='Accept all']"));
		// acceptButton.click();
		// const elem = await driver.findElement(By.name('q'));
		// driver.wait(until.elementIsEnabled(elem));
		// elem.sendKeys('webdriver', Key.RETURN);

		await navigateTo3dRepo(driver);
		await enterCredentials(driver, { username: 'teamSpace1', password: 'vdN5xQTQRY6syiD' });
	} finally {
		await driver.quit();
	}
}());
