
console.log("Importing e2e test dependencies...");
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as env from "./environment";
import { ElementFinder, browser, by, element } from "protractor";

// Necessary for async chai (eventually)
chai.use(chaiAsPromised);
const expect = chai.expect;

// Username and password for running e2e tests
const USER = {
    USERNAME: "jamesm",
    PASSWORD: "test"
}

// Assumes you are logged out
export function login() {
    browser.get(env.baseUrl);
    browser.waitForAngular();
    element(by.model("vm.user.username")).sendKeys(USER.USERNAME)
    element(by.model("vm.user.password")).sendKeys(USER.PASSWORD);
    element(by.css(".loginButton")).click();
}

// Assumes you are logged in
export function logout() {
    browser.waitForAngular();
    element(by.css(".accountMenuButton")).click();
    element(by.css('[ng-click="vm.logout()"]')).click();
}

// EXPORTS
export { USER };
export { expect };
export { env };
export { ElementFinder, browser, by, element } from "protractor";