const { until } = require('selenium-webdriver')

const waitForElementToBeReady = async (driver, locator, timeout = 15000) => {
	const element = await driver.wait(until.elementLocated(locator), timeout);
	await driver.wait(until.elementIsVisible(element), timeout);
	return element
};

const takeScreenshot = async (driver) => {
	const screenshot = await driver.takeScreenshot();
	console.log(`<img src="data:image/gif;base64,${screenshot}" />`)
}

const delay =  async (time) =>  new Promise((resolve) => setTimeout(resolve, time));

module.exports = { waitForElementToBeReady, takeScreenshot, delay };