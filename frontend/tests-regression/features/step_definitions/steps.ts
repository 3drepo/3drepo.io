import { When, Then, Given, AfterAll, BeforeAll } from "@cucumber/cucumber";
import { Builder, By, Capabilities, Key, until } from 'selenium-webdriver';
import { expect } from 'chai';
import { resizeWindow } from "../helpers/selenium.helpers";

let driver
BeforeAll(async ()=> {
  driver = new Builder().forBrowser('chrome').build();
  resizeWindow(driver, {width: 1024, height: 768});
})

Given('I am on the Google search page', async function () {
  await driver.get('https://www.google.com/?gws_rd=ssl');

  try{
    const accceptButton = await driver.findElement(By.xpath("//div[text()='Accept all']"));
    await accceptButton.click();
  } catch(e) {
  }
});

When('I search for {string}', async function (searchTerm) {
  const element = await driver.findElement(By.name('q'));
  await driver.wait(until.elementIsEnabled(element));
  await element.sendKeys(searchTerm, Key.RETURN);
});

Then('the page title should start with {string}', {timeout: 60 * 1000}, async function (searchTerm) {
  const title = await driver.getTitle();
  const isTitleStartWithCheese = title.toLowerCase().lastIndexOf(`${searchTerm}`, 0) === 0;
  expect(isTitleStartWithCheese).to.equal(true);
});

AfterAll(async () => {
  await driver.quit();
});