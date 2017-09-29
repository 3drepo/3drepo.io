"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Legal links", () => {
    before(() => {
        imports_1.browser.get(imports_1.env.baseUrl);
    });
    after(() => {
        imports_1.logout();
    });
    describe("are visible logged out", () => {
        const legal = imports_1.element(imports_1.by.id("legalLinks"));
        it("with a holding box", () => {
            imports_1.expect(legal.isDisplayed()).to.eventually.equal(true);
        });
        it("all the correct links", () => {
            imports_1.expect(legal.all(imports_1.by.linkText("Terms & Conditions")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Privacy")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
        });
    });
    describe("should exist if logged in", () => {
        const legal = imports_1.element(imports_1.by.id("legalLinks"));
        it("with a holding box", function () {
            this.timeout(6000);
            imports_1.login();
            imports_1.expect(legal.isDisplayed()).to.eventually.equal(true);
        });
        it("all the correct links", () => {
            imports_1.expect(legal.all(imports_1.by.linkText("Terms & Conditions")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Privacy")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
            imports_1.expect(legal.all(imports_1.by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
        });
    });
});
