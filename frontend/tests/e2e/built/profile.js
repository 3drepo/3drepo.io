"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Profile page ", function () {
    this.timeout(6000);
    before(() => {
        imports_1.login();
    });
    after(() => {
        imports_1.logout();
    });
    describe("should load the profile page content ", () => {
        it(" when we click on the profile page", () => {
            const profile = imports_1.element.all(imports_1.by.repeater("(key, value) in vm.accountOptions")).filter(function (elem, index) {
                return elem.getText().then(function (text) {
                    return text === 'Profile';
                });
            });
            profile.click();
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-profile")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-profile")).isDisplayed()).to.eventually.equal(true);
        });
    });
});
