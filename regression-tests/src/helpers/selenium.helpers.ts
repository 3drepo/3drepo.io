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
import { Builder, until, By, WebDriver, Locator } from 'selenium-webdriver';
import * as config from '../../config.json';
import { getUrl } from './routing.helpers';
import { reTry } from './functions.helpers';

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

// getElement is more robust thatn findElement; in the case the page is loading it will wait until the element is available
// and then try to find the element
export const getElement = async (driver: WebDriver, locator: Locator) => {
	await driver.wait(until.elementLocated(locator), 100000);
	return driver.findElement(locator);
};

export const initializeSeleniumDriver = async (browserType) => {
	const driver = await new Builder().forBrowser(browserType).build();
	await resizeWindow(driver, config.browserSize);
	return driver;
};

export const waitUntilPageLoaded = async (driver) => driver.wait(until.elementLocated(By.css('body')));

export const waitForText = async (driver: WebDriver, text:string ) => {
	const target =  By.xpath('//*[contains(text(),"' +  text + '")]');
	return getElement(driver, target);
};

const findInputNearText = async (driver: WebDriver, text:string, inputType: string = '') => {
	const typefilter = inputType ? '[@type="' + inputType  + '"]' : '';
	const targetText = '//*[contains(text(),"' +  text + '")]//ancestor::*/*/input' + typefilter;
	const target = By.xpath(targetText);
	return getElement(driver, target);
};

export const fillInputByLabel = async (driver: WebDriver, label, value) => {
	const input = await findInputNearText(driver, label);
	await driver.wait(until.elementIsVisible(input));
	await input.sendKeys(value);
};

export const navigateTo = async (driver:WebDriver, page:string) => {
	await driver.get(getUrl(page));
	await driver.wait(until.elementLocated(By.css('body')), 100000);
};

export const clickOn = async (driver: WebDriver, buttonContent:string) => {
	await waitUntilPageLoaded(driver);
	const withText = "[contains(text(),'" + buttonContent + "')]";
	const text = '//body//*' + withText + '';
	const target = By.xpath(text);
	const link  = await getElement(driver, target);
	await driver.wait(until.elementIsEnabled(link));
	await link.click();
};

export const fillInForm = async (driver: WebDriver, fields: Record<string, string>) => {
	await waitUntilPageLoaded(driver);
	await Promise.all(Object.keys(fields).map((labelName)=> fillInputByLabel(driver, labelName, fields[labelName])));
};

export const clickOnCheckboxNearText = async (driver: WebDriver, text: string) => {
	// TODO: make this checkbox a bit more robust. sometimes it picks another checkbox 
	const checkbox = await findInputNearText(driver, text, 'checkbox');
	await driver.wait(until.elementIsEnabled(checkbox), 100000);

	await reTry(async () => {
		await checkbox.click();
	}, 100, 50);
};

export const closeOriginWindow = async (driver: WebDriver) => {
	const windows = await (driver as WebDriver).getAllWindowHandles();
	await driver.switchTo().window(windows[0]);
	await driver.close();
	await driver.switchTo().window(windows[1]);
};
