"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Login page ", () => {
    before(() => {
        imports_1.browser.get(imports_1.env.baseUrl);
    });
    after(() => {
        imports_1.logout();
    });
    describe("should have login box", () => {
        it("with a correct title", () => {
            imports_1.expect(imports_1.browser.getTitle()).to.eventually.equal("3D Repo | Online BIM collaboration platform");
        });
        it("with the 3D Repo logo", () => {
            imports_1.expect(imports_1.element(imports_1.by.id("homeLogo")).isPresent()).to.eventually.equal(true);
        });
        it("with a welcome message", () => {
            imports_1.expect(imports_1.element(imports_1.by.css(".welcome")).isPresent()).to.eventually.equal(true);
        });
        it("with a login button", () => {
            imports_1.expect(imports_1.element(imports_1.by.css(".loginButton")).isPresent()).to.eventually.equal(true);
        });
        it("with username and password fields bound to a model", () => {
            imports_1.expect(imports_1.element(imports_1.by.model("vm.user.username")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.model("vm.user.password")).isPresent()).to.eventually.equal(true);
        });
    });
    describe("should login correctly", () => {
        it("when username and password are inserted", function () {
            this.timeout(6000);
            imports_1.element(imports_1.by.model("vm.user.username")).sendKeys(imports_1.USER.USERNAME);
            imports_1.element(imports_1.by.model("vm.user.password")).sendKeys(imports_1.USER.PASSWORD);
            imports_1.element(imports_1.by.css(".loginButton")).click();
            imports_1.expect(imports_1.element(imports_1.by.id("accountItem")).isPresent()).to.eventually.equal(true);
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-teamspaces")).isPresent()).to.eventually.equal(true);
        });
    });
});
