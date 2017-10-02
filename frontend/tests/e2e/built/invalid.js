"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Invalid pages ", function () {
    this.timeout(10000);
    describe("whilst logged in", () => {
        it("should redirect to login page", () => {
            imports_1.browser.get(imports_1.env.baseUrl + "/invalid");
            const login = imports_1.element(imports_1.by.tagName("login"));
            imports_1.expect(login.isPresent()).to.eventually.equal(true);
        });
    });
    describe("whilst logged out", () => {
        it("should redirect to account page if logged in", () => {
            imports_1.login();
            imports_1.browser.get(imports_1.env.baseUrl + "/invalid");
            const teamspaces = imports_1.element(imports_1.by.tagName("account-teamspaces"));
            imports_1.expect(teamspaces.isPresent()).to.eventually.equal(true);
            imports_1.logout();
        });
    });
});
