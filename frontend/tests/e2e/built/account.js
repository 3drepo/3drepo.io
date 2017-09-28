"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imports_1 = require("./config/imports");
describe("Account page ", function () {
    this.timeout(6000);
    before(() => {
        imports_1.login();
    });
    after(() => {
        imports_1.logout();
    });
    describe("should load the account page content ", () => {
        it("with the 3D Repo logo", () => {
            imports_1.expect(imports_1.element(imports_1.by.id("homeLogo")).isPresent()).to.eventually.equal(true);
        });
        it("with the a holder for the avatar", () => {
            imports_1.expect(imports_1.element(imports_1.by.css(".account-avatar-image")).isPresent()).to.eventually.equal(true);
        });
        it(" with the navigation sidebar", () => {
            imports_1.expect(imports_1.element(imports_1.by.id("account")).isPresent()).to.eventually.equal(true);
        });
        it(" with the main content holder", () => {
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-info")).isPresent()).to.eventually.equal(true);
        });
        it(" with all the correct tabs", () => {
            const tabs = imports_1.element.all(imports_1.by.repeater('(key, value) in vm.accountOptions'));
            imports_1.expect(tabs.get(0).getText()).to.eventually.equal("Teamspaces");
            imports_1.expect(tabs.get(1).getText()).to.eventually.equal("Profile");
            imports_1.expect(tabs.get(2).getText()).to.eventually.equal("Billing");
            imports_1.expect(tabs.get(3).getText()).to.eventually.equal("Licenses");
        });
        it(" with the account button present", () => {
            imports_1.expect(imports_1.element(imports_1.by.css(".accountMenuButton")).isPresent()).to.eventually.equal(true);
        });
    });
    describe("should load to Teamspaces tab ", () => {
        it(" and have the content pane for teamspaces", () => {
            imports_1.expect(imports_1.element(imports_1.by.tagName("account-teamspaces")).isPresent()).to.eventually.equal(true);
        });
        it(" with the account button present", () => {
            imports_1.expect(imports_1.element(imports_1.by.css(".accountMenuButton")).isPresent()).to.eventually.equal(true);
        });
        it(" and there should be hint text for adding projects, models, federations", () => {
            imports_1.expect(imports_1.element(imports_1.by.css(".addHint")).isPresent()).to.eventually.equal(true);
        });
        it(" and button for adding projects, models and federations should exist", () => {
            imports_1.expect(imports_1.element(imports_1.by.css('[ng-click="vm.addButtonsToggle()"]')).isPresent()).to.eventually.equal(true);
        });
        it(" and add button should show add menu and hide on second click", () => {
            imports_1.element(imports_1.by.css('[ng-click="vm.addButtonsToggle()"]')).click();
            imports_1.expect(imports_1.element(imports_1.by.id("floating-button")).isDisplayed()).to.eventually.equal(true);
            imports_1.element(imports_1.by.css('[ng-click="vm.addButtonsToggle()"]')).click();
            imports_1.expect(imports_1.element(imports_1.by.id("floating-button")).isDisplayed()).to.eventually.equal(false);
        });
        it(" has the test teamspace listed in the teamspace tree", () => {
            const sel = '[ng-click="vm.toggleProjects(account.projects)"]';
            const teamspace = imports_1.element.all(imports_1.by.css(sel)).all(imports_1.by.tagName('p'));
            imports_1.expect(teamspace.count()).to.eventually.be.greaterThan(0);
            imports_1.expect(teamspace.filter(function (elem, index) {
                return elem.getText().then(function (text) {
                    return text === imports_1.USER.USERNAME;
                });
            }).first().getText()).to.eventually.be.equal(imports_1.USER.USERNAME);
        });
        it(" has the model and federation buttons listed in the tree", () => {
            const modelListItems = imports_1.element(imports_1.by.id("accountList")).all(imports_1.by.css('[ng-click="vm.toggleModels(project)"]'));
            imports_1.expect(modelListItems.isPresent()).to.eventually.be.equal(true);
            const fedListItems = imports_1.element(imports_1.by.id("accountList")).all(imports_1.by.css('[ng-click="vm.toggleFederations(project)"]'));
            imports_1.expect(fedListItems.isPresent()).to.eventually.be.equal(true);
        });
    });
});
