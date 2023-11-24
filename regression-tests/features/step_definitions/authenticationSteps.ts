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

import { Then, When } from '@cucumber/cucumber';
import { getLatestMailFor } from '../../src/helpers/mailhog.helpers';
import { WebDriver } from 'selenium-webdriver';
import { reTry } from '../../src/helpers/functions.helpers';
import { clickOn, clickOnCheckboxNearText, closeOriginWindow, fillInForm, navigateTo, waitForText } from '../../src/helpers/selenium.helpers';
import { pick } from '../../src/helpers/general.helpers';

Then('I verify the account from email {string}', async function (email) {
	const mailContent = await reTry(async () => {
		const mail = await getLatestMailFor(this.driver, email);

		if (!mail) {
			throw new Error('Mail not received');
		}

		return mail;
	}, 100, 100);


	await (this.driver as WebDriver).executeScript('document.write(`' + mailContent + '`)');
	await clickOn(this.driver, 'Verify email address');
	await closeOriginWindow(this.driver);
	await waitForText(this.driver, 'Your account has been verified');
});

When('I try to signup with:', async function (datatable) {
	const formValues = datatable.hashes()[0];
	await navigateTo(this.driver, 'signup');
	await fillInForm(this.driver, pick(formValues, ['Username', 'Email', 'Password']));
	await clickOn(this.driver, 'Next step');
	await fillInForm(this.driver, pick(formValues, ['First name', 'Last name']));
	await clickOn(this.driver, 'Next step');
	await clickOnCheckboxNearText(this.driver, 'I agree');
	await clickOn(this.driver, 'Create account');
});