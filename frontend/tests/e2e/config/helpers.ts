import { ElementFinder, browser, by, element } from "protractor";
import { USER } from "./user";
import * as env from "./environment";

// Assumes you are logged out
export function login() {
    browser.get(env.baseUrl);
    browser.waitForAngular();
    element(by.model("vm.user.username")).sendKeys(USER.USERNAME)
    element(by.model("vm.user.password")).sendKeys(USER.PASSWORD);
    element(by.css(".loginButton")).click();
    browser.waitForAngular();
}

// Assumes you are logged in
export function logout() {
    browser.waitForAngular();
    element(by.css(".accountMenuButton")).click();
    element(by.css('[ng-click="vm.logout()"]')).click();
    browser.waitForAngular();
}

export function hasClass(element, cls) {
    return element.getAttribute('class').then((classes) => {
        return classes.split(' ').indexOf(cls) !== -1;
    });
};