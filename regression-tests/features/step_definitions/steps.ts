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

import { When, Then, Given, Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from 'chai';
import { until } from 'selenium-webdriver';
import { clickOn, closeOriginWindow, delay, fillInForm, findElementNearText, initializeSeleniumDriver, navigateTo, waitForText, waitUntilPageLoaded } from '../../src/helpers/selenium.helpers';
import { getLogin, logout } from '../../src/helpers/api.helpers';
import { domain } from '../../config.json';
import { getUrl } from '../../src/helpers/routing.helpers';
import { getUserForRole } from '../../src/helpers/users.helpers';
import { getEmailCount } from '../../src/helpers/mailhog.helpers';

setDefaultTimeout(120 * 1000);

Before(async function () {
	this.driver = await initializeSeleniumDriver('chrome');
});

Given('Im not logged in', async function () {
	await this.driver.get(domain);
	await waitUntilPageLoaded(this.driver);

	const res = await getLogin(this.driver);

	if (res.status === 200) {
		await logout(this.driver);
	}
});

When('I navigate to {string}', async function (page) {
	await navigateTo(this.driver, page);
});

When('I navigate to the {string} page', async function (page) {
	await navigateTo(this.driver, page);
});

When('I sign in as {string}', async function (role: string) {
	const { username, password } = getUserForRole(role);
	await waitUntilPageLoaded(this.driver);
	await fillInForm(this.driver, { Username: username, Password: password });
	await clickOn(this.driver, 'Log in');
});

When('I sign in with:', async function (datatable) {
	await navigateTo(this.driver, 'login');
	await waitUntilPageLoaded(this.driver);
	await fillInForm(this.driver,  datatable.hashes()[0]);
	await clickOn(this.driver, 'Log in');
});


When('I click on {string}', async function (linkContent: string) {
	await clickOn(this.driver, linkContent);
});


When('I fill in the form with:', async function (datatable) {
	await fillInForm(this.driver, datatable.hashes()[0]);
});

When('I wait until {string} text appears', async function (text) {
	try {
		await waitForText(this.driver, text);
	} catch (e) {
		throw new Error(`The text "${text}" never appeared :(`);
	}
});

Then('I should be redirected to the {string} page', async function (page) {
	await this.driver.wait(until.urlIs(getUrl(page)));
	expect(true).to.equals(true);
});

When('button {string} should be disabled', async function (buttonText) {
	const element = await findElementNearText(this.driver, buttonText, 'button');
	expect(await element.isEnabled()).to.equals(false);
});

When('I close the original window', async function () {
	await closeOriginWindow(this.driver);
});

When('I shouldnt get email', async function () {
	expect(await getEmailCount(this.driver)).to.equals(0);
});

When('in another browser', async function () {
	this.oldDriver = this.driver;
	this.driver = await initializeSeleniumDriver('chrome');
});

When('I switch back', async function () {
	await this.driver.quit();
	this.driver = this.oldDriver;
	this.oldDriver = null;
});

When('I sign in at Microsoft with:', async function (datatable) {
	const hashes = datatable.hashes()[0] ;
	const labels = Object.keys(hashes);
	await fillInForm(this.driver, { [labels[0]]: hashes[labels[0]] });
	await clickOn(this.driver, 'Next');
	await fillInForm(this.driver, { [labels[1]]: hashes[labels[1]] });
	await clickOn(this.driver, 'Sign in');


	// await this.driver.quit();
	// this.driver = this.oldDriver;
	// this.oldDriver = null;
});



// For debugging test purposes
When('I wait for {int} seconds', async function (seconds) {
	await delay(seconds * 1000);
});

After(async function () {
	await this.driver.quit();
});
