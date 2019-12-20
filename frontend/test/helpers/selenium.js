const { until } = require('selenium-webdriver')

const waitForElementToBeReady = async (driver, locator, timeout) => {
	const element = await driver.wait(until.elementLocated(locator), timeout);
	await driver.wait(until.elementIsVisible(element), timeout);
	return element
  };

const takeScreenshot = async (driver, name) => {
	const screenshot = await driver.takeScreenshot();

	return new Promise((resolve, reject)=> {
	  require("fs").writeFile(name, screenshot, 'base64', function(err) {
		if (err) {
		  reject(err);
		} else {
		  resolve(screenshot);
		}
	  });
	});
  }

const delay =  async (time) =>  new Promise((resolve) => setTimeout(resolve, time));

module.exports = { waitForElementToBeReady, takeScreenshot, delay };