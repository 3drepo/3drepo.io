"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Privacy page ", function () {
    this.timeout(6000);
    describe("should load the privacy page ", () => {
        before(() => {
            imports_1.browser.get(imports_1.env.baseUrl + "/privacy");
            imports_1.browser.waitForAngular();
        });
        it("with the 3D Repo logo", () => {
            imports_1.expect(imports_1.element(imports_1.by.id("homeLegalContainer")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.tagName("privacy")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.id("legal")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.id("legalText")).isPresent()).to.eventually.equal(true);
        });
    });
});
