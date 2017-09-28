"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Licenses page ", function () {
    this.timeout(6000);
    before(() => {
        imports_1.login();
    });
    after(() => {
        imports_1.logout();
    });
    describe("should load the licenses page content ", () => {
        it(" when we click on the licenses page", () => {
            const licenses = imports_1.element.all(imports_1.by.repeater("(key, value) in vm.accountOptions")).filter(function (elem, index) {
                return elem.getText().then(function (text) {
                    return text === 'Licenses';
                });
            });
            licenses.click();
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-licenses")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-licenses")).isDisplayed()).to.eventually.equal(true);
        });
    });
});
