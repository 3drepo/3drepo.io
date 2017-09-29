"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Sign up page ", () => {
    before(() => {
        imports_1.browser.get(imports_1.env.baseUrl + "/signUp");
    });
    describe("should have sign up box", () => {
        const checkbox = imports_1.element(imports_1.by.tagName("sign-up"));
        it("with a container to holder inputs", () => {
            imports_1.expect(checkbox.isDisplayed()).to.eventually.equal(true);
        });
        it("with correct input boxes", () => {
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.username")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.password")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.firstName")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.lastName")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.email")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.phoneNo")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.company")).isDisplayed()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.newUser.jobTitle")).isDisplayed()).to.eventually.equal(true);
        });
        it("with a terms and conditions check box", () => {
            imports_1.expect(checkbox.all(imports_1.by.id("tc")).count()).to.eventually.equal(1);
            imports_1.expect(checkbox.all(imports_1.by.id("tc")).first().isDisplayed()).to.eventually.equal(true);
        });
        it("with a sign up button", () => {
            imports_1.expect(checkbox.all(imports_1.by.css(".sign-up-button")).count()).to.eventually.equal(1);
            imports_1.expect(checkbox.all(imports_1.by.css(".sign-up-button")).first().isDisplayed()).to.eventually.equal(true);
        });
        it("with a Log in link", () => {
            imports_1.expect(checkbox.all(imports_1.by.linkText("Log in")).count()).to.eventually.equal(1);
            imports_1.expect(checkbox.all(imports_1.by.linkText("Log in")).first().isDisplayed()).to.eventually.equal(true);
        });
        it("with a Pricing link", () => {
            imports_1.expect(checkbox.all(imports_1.by.linkText("Pricing")).count()).to.eventually.equal(1);
            imports_1.expect(checkbox.all(imports_1.by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
        });
        it("trying to login without any field filled in fails", () => {
            imports_1.element(imports_1.by.css('[ng-click="vm.register()"]')).click();
            const error = imports_1.element(imports_1.by.css(".registerError"));
            imports_1.expect(error.isDisplayed()).to.eventually.equal(true);
            imports_1.expect(error.getText()).to.eventually.equal("Please fill all required fields");
        });
    });
});
