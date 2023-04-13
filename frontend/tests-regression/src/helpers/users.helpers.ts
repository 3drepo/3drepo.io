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
import { WebDriver, until, By } from 'selenium-webdriver';
import { usersProfiles } from '../../config.json';
import { getUrl } from './routing.helpers';

export interface UserProfile {
	username: string,
	password: string
}

export const getUserForRole = (role):UserProfile => usersProfiles[role];

export const signIn = async (driver: WebDriver, { username, password }: UserProfile) => {
	await driver.wait(until.urlIs(getUrl('login')));
	const usernameInput = await driver.findElement(By.name('username'));
	await driver.wait(until.elementIsEnabled(usernameInput));
	usernameInput.sendKeys(username);
	const passwordInput = await driver.findElement(By.name('password'));
	await driver.wait(until.elementIsEnabled(passwordInput));
	passwordInput.sendKeys(password);
	const loginButton = await driver.findElement(By.xpath("//button[contains(text(),'Log in')]"));
	await driver.wait(until.elementIsEnabled(loginButton));
	loginButton.click();
};
