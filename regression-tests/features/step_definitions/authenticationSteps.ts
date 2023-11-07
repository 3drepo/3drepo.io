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

import { Then } from '@cucumber/cucumber';
import { getLatestMailFor } from '../../src/helpers/mailhog.helpers';
import { WebDriver } from 'selenium-webdriver';
import { clickOn } from '../../src/helpers/selenium.helpers';

Then('I navigate to verify account from email {string}', async function (email) {
	const mailContent = await getLatestMailFor(this.driver, email);
	if (!mailContent) {
		throw new Error('Mail not received');
	}

	await (this.driver as WebDriver).executeScript('document.write(`' + mailContent + '`)');
	await clickOn(this.driver, 'Verify');
	await (this.driver as WebDriver).executeAsyncScript('var a = 1;');
});