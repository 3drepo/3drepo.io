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

import { When, Then, Given, Before, After } from '@cucumber/cucumber';
import { expect } from 'chai';
import { until } from 'selenium-webdriver';
import { clickOn, initializeSeleniumDriver, navigateTo, signIn, waitUntilPageLoaded } from '../../src/helpers/selenium.helpers';
import { getLogin, logout } from '../../src/helpers/api.helpers';
import { domain } from '../../config.json';
import { getUrl } from '../../src/helpers/routing.helpers';
import { getUserForRole } from '../../src/helpers/users.helpers';

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
	const user = getUserForRole(role);
	await signIn(this.driver, user);
});

When('I sign in as {string}', async function (role: string) {
	const user = getUserForRole(role);
	await signIn(this.driver, user);
});

When('I click on {string}', async function (linkContent: string) {
	await clickOn(this.driver, linkContent);
});

Then('I should be redirected to the {string} page', async function (page) {
	await this.driver.wait(until.urlIs(getUrl(page)));
	expect(true).to.equals(true);
});

After(async function () {
	await this.driver.quit();
});
