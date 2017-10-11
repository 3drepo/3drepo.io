import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Account page ", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the account page content ", () => {

		it("with the 3D Repo logo", () => {
			expect(element(by.id("homeLogo")).isPresent()).to.eventually.equal(true);
		});

		it("with the a holder for the avatar", () => {
			expect(element(by.css(".account-avatar-image")).isPresent()).to.eventually.equal(true);
		});
		
		it(" with the navigation sidebar", () => {
			expect(element(by.id("account")).isPresent()).to.eventually.equal(true);
		});

		it(" with the main content holder", () => {
			expect(element(by.tagName("account-info")).isPresent()).to.eventually.equal(true);
		});

		it(" with all the correct tabs", () => {
			const tabs = element.all(by.repeater('(key, value) in vm.accountOptions'))
			expect(tabs.get(0).getText()).to.eventually.equal("Teamspaces");
			expect(tabs.get(1).getText()).to.eventually.equal("Profile");
			expect(tabs.get(2).getText()).to.eventually.equal("Billing");
			expect(tabs.get(3).getText()).to.eventually.equal("Licences");
			// TODO: fix this on staging
			//expect(tabs.get(4).getText()).to.eventually.equal("Assign Permissions");
		});

		it(" with the account button present", () => {
			expect(element(by.css(".accountMenuButton")).isPresent()).to.eventually.equal(true);
		});

	});

	describe("should load to Teamspaces tab ", () => {

		it(" and have the content pane for teamspaces", () => {
			expect(element(by.tagName("account-teamspaces")).isPresent()).to.eventually.equal(true);
		});

		it(" with the account button present", () => {
			expect(element(by.css(".accountMenuButton")).isPresent()).to.eventually.equal(true);
		});

		it(" and there should be hint text for adding projects, models, federations", () => {
			expect(element(by.css(".addHint")).isPresent()).to.eventually.equal(true);
		});

		it("and button for adding projects, models and federations should exist", () => {
			expect(element(by.id('addButtons')).isPresent()).to.eventually.equal(true);
		});

		it(" has the test teamspace listed in the teamspace tree", () => {
			
			//TODO: Use classes instead of ng-click
			const sel = '[ng-click="vm.toggleProjects(account.projects)"]';
			const teamspace = element.all(by.css(sel)).all(by.tagName('p'));

			// Test that some teamspaces are there at all
			expect(teamspace.count()).to.eventually.be.greaterThan(0);

			// Test that the test users project is there specfically
			expect(teamspace.filter(function(elem, index) {
				return elem.getText().then(function(text) {
				  return text === USER.USERNAME;
				});
			}).first().getText()).to.eventually.be.equal(USER.USERNAME);

		});

		it(" has the model and federation buttons listed in the tree", () => {
			
			//TODO: Use classes instead of ng-click
			const modelListItems = element(by.id("accountList")).all(by.css('[ng-click="vm.toggleModels(project)"]'));
	
			expect(modelListItems.isPresent()).to.eventually.be.equal(true);

			const fedListItems = element(by.id("accountList")).all(by.css('[ng-click="vm.toggleFederations(project)"]'));
	
			expect(fedListItems.isPresent()).to.eventually.be.equal(true);

		});

	});

});