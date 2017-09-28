"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Billing page ", function () {
    this.timeout(6000);
    before(() => {
        imports_1.login();
    });
    after(() => {
        imports_1.logout();
    });
    describe("should load the billing page content ", () => {
        it(" when we click on the billing page", () => {
            const billing = imports_1.element.all(imports_1.by.repeater("(key, value) in vm.accountOptions")).filter(function (elem, index) {
                return elem.getText().then(function (text) {
                    return text === 'Billing';
                });
            });
            billing.click();
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-billing")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-billing")).isDisplayed()).to.eventually.equal(true);
        });
    });
});
