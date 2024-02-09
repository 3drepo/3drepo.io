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
import { Builder, until, By, WebDriver, Locator, WebElement } from 'selenium-webdriver';
import * as config from '../../config.json';
import { getUrl } from './routing.helpers';
import { distanceBetweenRects } from './rect.helpers';

type Label = string;
type Value = string;

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
	await driver.wait(until.elementLocated(locator), 3000);
	return driver.findElement(locator);
};

export const getElements = async (driver: WebDriver, locator: Locator) => {
	await driver.wait(until.elementLocated(locator), 3000);
	return driver.findElements(locator);
};

export const animationsEnded = async (driver: WebDriver) =>
	driver.executeScript(async () => {
		const reAnimationEvent = /^onanimation/;
		const reTransitionEvent = /^ontransition/;
		let lastTime = new Date();
		let resolve = null;
		const prom = new Promise((r) => resolve = r);
		
		const animationEvents = (target, listener, subscribe = true) => {
			for (const key in target) {
				if (reAnimationEvent.test(key) || reTransitionEvent.test(key)) {
					const eventType = key.substring(2);
					if (subscribe)
						target.addEventListener(eventType, listener);
					else
						target.removeEventListener(eventType, listener);
				}
			}
		};

		const onAnimationEvent = () => lastTime = new Date();

		let intervalId = undefined;
		intervalId = setInterval( () => {
			const now = new Date();
			if (Number(now) - Number(lastTime) > 200) {
				animationEvents(document.body, onAnimationEvent, false);
				clearInterval(intervalId);
				resolve();
			}
		}, 50);

		animationEvents(document.body, onAnimationEvent);
		return prom;
	})
;

export const initializeSeleniumDriver = async (browserType) => {
	const driver = await new Builder().forBrowser(browserType).build();
	await resizeWindow(driver, config.browserSize);
	return driver;
};

export const waitForText = async (driver: WebDriver, text:string ) => {
	const target =  By.xpath('//body//*[contains(text(),"' +  text + '")]');
	return getElement(driver, target);
};

const getClientRects = async (driver: WebDriver, elements:WebElement[]):Promise<(DOMRect | null)[]> =>
	driver.executeScript((elems: Element[]) => {
		return elems.map((el) => el.getClientRects()).map((rect) => rect.item(0));
	}, elements);

const findCloserRectIndex = (rect: DOMRect, rects: (DOMRect | null)[]) => {
	let minDistance = Infinity;
	let index = -1;
	if (!rect) return index;

	rects.forEach((otherRect, rectIndex) => {
		if (otherRect === null) return;
		const distance = distanceBetweenRects(rect, otherRect);
		if (distance < minDistance) {
			minDistance = distance;
			index = rectIndex;
		}
	});

	return index;
};

export const findElementsNearText = async (driver: WebDriver, text:string, tag:string) => {
	const str = `//body//*[contains(text(),"${text}")]`;
	const textElements = await getElements(driver,  By.xpath(str));
	const tagElements = await getElements(driver,  By.xpath(`//body//${tag}`));

	const textElementsRects = await getClientRects(driver, textElements);
	const tagElementsRects = await getClientRects(driver, tagElements);

	const results: { textElement: WebElement, closerElement:WebElement }[]  = [];

	textElements.forEach((textElement, index) => {
		const rect = textElementsRects[index];
		const closerElement =  tagElements[findCloserRectIndex(rect, tagElementsRects)];
		results.push({ textElement, closerElement });
	});

	return results;
};

export const findElementNearText = async (driver: WebDriver, text:string, tag: string) => {
	const result = (await findElementsNearText(driver, text, tag))[0];
	return result?.closerElement;
};

export const findInputNearText = async (driver: WebDriver, text:string) => findElementNearText(driver, text, 'input');

export const fillInputByLabel = async (driver: WebDriver, label, value) => {
	const input = await findInputNearText(driver, label);
	await driver.wait(until.elementIsVisible(input));
	await input.sendKeys(value);
};

export const waitForPageToBeLoaded = async (driver: WebDriver) => {
	await driver.wait(until.elementLocated(By.css('body')), 100000);
	await animationsEnded(driver);
};

export const navigateTo = async (driver:WebDriver, page:string) => {
	await driver.get(getUrl(page));
	await waitForPageToBeLoaded(driver);
};

export const closeOriginWindow = async (driver: WebDriver) => {
	const windows = await (driver as WebDriver).getAllWindowHandles();
	await driver.switchTo().window(windows[0]);
	await driver.close();
	await driver.switchTo().window(windows[1]);
};

export const clickOn = async (driver: WebDriver, buttonContent:string, elementNumber?:number) => {
	await waitForPageToBeLoaded(driver);
	const text = `//body//*[text()="${buttonContent}"]|//body//input[@value='${buttonContent}']`;
	const target = By.xpath(text);
	const elements = await getElements(driver, target);

	let link;

	if (elementNumber) {
		link = elements[elementNumber - 1]; // element number starts from 1
	} else {

		const tagOrder = ['a', 'button', 'input', 'div'];
		const getTagPriority = (tag):number => tagOrder.includes(tag) ? tagOrder.indexOf(tag) : tagOrder.length;

		await Promise.all(elements.map(async (element) => {
			(element as any).tag = await element.getTagName();
		}));
		
		link = elements.sort((a:any, b:any) => getTagPriority(a.tag) - getTagPriority(b.tag)) [0];
	}

	await driver.wait(until.elementIsEnabled(link));
	await link.click();
};

export const fillInForm = async (driver: WebDriver, fields: Record<Label, Value>) => {
	await waitForPageToBeLoaded(driver);
	try {
		await Promise.all(Object.keys(fields).map((labelName)=> fillInputByLabel(driver, labelName, fields[labelName])));
	} catch (e) {
		// there is a tolarance on the label in order to reuse the same table
		console.warn('Warning when trying to fillInForm');
		console.warn(e);
	}

};

export const clickOnCheckboxNearText = async (driver: WebDriver, text: string) => {
	await animationsEnded(driver);
	const checkbox = await findInputNearText(driver, text);
	await driver.wait(until.elementIsEnabled(checkbox), 100000);
	await checkbox.click();
};


const buttonsPaths = {
	'avatar': '(//button)[4]',
};

const menuPathToXPaths = (menuPath) => {
	const chunks = menuPath.split('>');

	return chunks.map((chunk) => {
		return  By.xpath(buttonsPaths[chunk] || `//body//*[text()="${chunk}"]`);
	});
};


export const clickOnMenu = async (driver: WebDriver, menuPath: string) => {
	const xpaths = menuPathToXPaths(menuPath);

	for (let i = 0; i < xpaths.length; i++) {
		const path = xpaths[i];
		try {
			await animationsEnded(driver);
			const element = await getElement(driver, path);
			await driver.wait(until.elementIsEnabled(element));
			await element.click();
		} catch (e) {
			console.error(e);
		}
	}
};

