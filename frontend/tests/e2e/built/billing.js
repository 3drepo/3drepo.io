"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Billing page ", function () {
    this.timeout(6000);
    before(() => {
        imports_1.login();
        const billing = imports_1.element.all(imports_1.by.repeater("(key, value) in vm.accountOptions")).filter(function (elem, index) {
            return elem.getText().then(function (text) {
                return text === 'Billing';
            });
        });
        billing.click();
    });
    after(() => {
        imports_1.logout();
    });
    describe("should load the billing page content ", () => {
        it("when we click on the billing page", () => {
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-billing")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-billing")).isDisplayed()).to.eventually.equal(true);
        });
        describe("it should have a tabs holder ", () => {
            it("with two tabs with the correct text", () => {
                const tabs = imports_1.element(imports_1.by.tagName("md-tabs-canvas")).all(imports_1.by.tagName("md-tab-item"));
                imports_1.expect(tabs.count()).to.eventually.equal(2);
                imports_1.expect(tabs.get(0).isDisplayed()).to.eventually.equal(true);
                imports_1.expect(tabs.get(0).getText()).to.eventually.equal("SUBSCRIPTION");
                imports_1.expect(tabs.get(1).isDisplayed()).to.eventually.equal(true);
                imports_1.expect(tabs.get(1).getText()).to.eventually.equal("HISTORY");
            });
            it("should start with the subscription tab", () => {
                const tabs = imports_1.element(imports_1.by.tagName("md-tabs-canvas")).all(imports_1.by.tagName("md-tab-item"));
                imports_1.hasClass(tabs.get(0), "md-active").then((answer) => {
                    imports_1.expect(answer).to.equal(true);
                });
            });
            it("that work when you click on them", () => {
                const tabs = imports_1.element(imports_1.by.tagName("md-tabs-canvas")).all(imports_1.by.tagName("md-tab-item"));
                tabs.get(1).click();
                imports_1.hasClass(tabs.get(1), "md-active").then((answer) => {
                    imports_1.expect(answer).to.equal(true);
                });
            });
        });
        describe("subscription tab should be correct in form ", () => {
            it("with the correct input fields", () => {
                imports_1.expect(imports_1.element(imports_1.by.model("vm.numNewLicenses")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.firstName")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.lastName")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.vat")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.line1")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.city")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.line2")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.postalCode")).isPresent()).to.eventually.equal(true);
                imports_1.expect(imports_1.element(imports_1.by.model("vm.newBillingAddress.countryCode")).isPresent()).to.eventually.equal(true);
            });
            it("with a confirm button", () => {
                const button = imports_1.element(imports_1.by.css(".accountBillingSave")).all(imports_1.by.tagName("button"));
                imports_1.expect(button.count()).to.eventually.equal(1);
            });
            it("with a PayPal logo", () => {
                const logo = imports_1.element(imports_1.by.css(".accountBillingSave")).all(imports_1.by.tagName("img"));
                imports_1.expect(logo.count()).to.eventually.equal(1);
            });
            it("with the consumer information", () => {
                const logo = imports_1.element.all(imports_1.by.css(".accountBillingAddressInfo"));
                imports_1.expect(logo.count()).to.eventually.equal(3);
            });
        });
        describe("history tab should be correct in form ", () => {
            it("with the table holder", () => {
                const tabs = imports_1.element(imports_1.by.tagName("md-tabs-canvas")).all(imports_1.by.tagName("md-tab-item"));
                tabs.get(1).click();
                imports_1.expect(imports_1.element(imports_1.by.id("accountBillingHistory")).isPresent()).to.eventually.equal(true);
            });
            it("with correct labels for the table", () => {
                const tabs = imports_1.element(imports_1.by.tagName("md-tabs-canvas")).all(imports_1.by.tagName("md-tab-item"));
                tabs.get(1).click();
                const labels = imports_1.element(imports_1.by.id("accountBillingHistory")).all(imports_1.by.tagName("label"));
                imports_1.expect(labels.count()).to.eventually.equal(6);
            });
        });
    });
});
