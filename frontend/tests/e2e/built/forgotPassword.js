"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Forgot password page ", () => {
    before(() => {
        imports_1.browser.get(imports_1.env.baseUrl + "/forgotPassword");
        imports_1.browser.waitForAngular();
    });
    describe("should have forgot password box", () => {
        const checkbox = imports_1.element(imports_1.by.tagName("password-forgot"));
        it("with a container to hold inputs", () => {
            imports_1.expect(checkbox.isDisplayed()).to.eventually.equal(true);
        });
        it("with correct input boxes", () => {
            imports_1.expect(imports_1.element(imports_1.by.model("vm.username")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.email")).isDisplayed()).to.eventually.equal(true);
        });
        it("with a forgot password button", () => {
            const button = imports_1.element(imports_1.by.css('[ng-click="vm.requestPasswordChange()"]'));
            imports_1.expect(button.isDisplayed()).to.eventually.equal(true);
        });
    });
});
