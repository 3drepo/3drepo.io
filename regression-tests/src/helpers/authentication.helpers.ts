/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import { fillInForm, clickOn } from './selenium.helpers';

export const signInInMicrosoft = async (driver, email, password) => {
	await fillInForm(driver, { 'Sign in': email });
	await clickOn(driver, 'Next');
	await fillInForm(driver, { 'Enter password': password });
	await clickOn(driver, 'Sign in');
	await clickOn(driver, 'Yes');
};

