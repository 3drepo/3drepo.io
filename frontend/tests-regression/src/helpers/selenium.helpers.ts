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
import { Builder, until, By, WebDriver } from 'selenium-webdriver';
import * as config from '../../config.json';
import { getUrl } from './routing.helpers';
import { UserProfile } from './users.helpers';

export const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

// This is for ensure that the size of the innerwidt/innerheight of the browser is exactly what
// regardless of the bars of the browser that is running the test
export const resizeWindow = async (driver, size) => {
	await driver.manage().window().setRect(size);
	const actualSize = await driver.executeScript('return ({ width: window.innerWidth, height: window.innerHeight})');
	const currentResolution = ({
		width: size.width * 2 - actualSize.width,
		height: size.height * 2 - actualSize.height,
	});

	await driver.manage().window().setRect(currentResolution);
};

export const initializeSeleniumDriver = async (browserType) => {
	const driver = await new Builder().forBrowser(browserType).build();
	await resizeWindow(driver, config.browserSize);
	return driver;
};

export const waitUntilPageLoaded = async (driver) => driver.wait(until.elementLocated(By.css('body')));

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

export const navigateTo = async (driver:WebDriver, page:string) => {
	await driver.get(getUrl(page));
	await driver.wait(until.elementLocated(By.css('body')), 100000);
};
