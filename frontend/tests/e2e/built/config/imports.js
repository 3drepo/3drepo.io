"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log("Importing e2e test dependencies...");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
const env = require("./environment");
exports.env = env;
const protractor_1 = require("protractor");
chai.use(chaiAsPromised);
const expect = chai.expect;
exports.expect = expect;
const USER = {
    USERNAME: process.env.E2EUSERNAME || "testuser",
    PASSWORD: process.env.E2EPASSWORD || "testuser"
};
exports.USER = USER;
function login() {
    protractor_1.browser.get(env.baseUrl);
    protractor_1.browser.waitForAngular();
    protractor_1.element(protractor_1.by.model("vm.user.username")).sendKeys(USER.USERNAME);
    protractor_1.element(protractor_1.by.model("vm.user.password")).sendKeys(USER.PASSWORD);
    protractor_1.element(protractor_1.by.css(".loginButton")).click();
}
exports.login = login;
function logout() {
    protractor_1.browser.waitForAngular();
    protractor_1.element(protractor_1.by.css(".accountMenuButton")).click();
    protractor_1.element(protractor_1.by.css('[ng-click="vm.logout()"]')).click();
}
exports.logout = logout;
var protractor_2 = require("protractor");
exports.ElementFinder = protractor_2.ElementFinder;
exports.browser = protractor_2.browser;
exports.by = protractor_2.by;
exports.element = protractor_2.element;
