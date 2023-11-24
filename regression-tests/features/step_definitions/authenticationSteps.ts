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
import { readLatestMailFor } from '../../src/helpers/mailhog.helpers';
import { clickOn, clickOnCheckboxNearText, closeOriginWindow, fillInForm, navigateTo, waitForText } from '../../src/helpers/selenium.helpers';
import { pick } from '../../src/helpers/general.helpers';

Then('I verify the account from email {string}', async function (email) {
	await readLatestMailFor(this.driver, email);
	await clickOn(this.driver, 'Verify email address', true);
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

When('I request email for forgot password with:', async function (datatable) {
	const formValues = datatable.hashes()[0];
	await navigateTo(this.driver, 'password-forgot');
	await fillInForm(this.driver, formValues);
	await clickOn(this.driver, 'Send request');
	await waitForText(this.driver, 'A password change request has been sent');
});

When('I reset the password from email {string} with new password {string}', async function (email, newPass) {
	await readLatestMailFor(this.driver, email);
	await clickOn(this.driver, 'Reset your password');
	await closeOriginWindow(this.driver);
	await fillInForm(this.driver, { 'New password': newPass });
	await clickOn(this.driver, 'Save changes');
});
