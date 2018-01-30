import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Account menu button", function() {

	this.timeout(60000);

	describe("should be", () => {
		
		before(() => {
			browser.get(env.baseUrl);
			browser.waitForAngular();
		})

		it("hidden on the login page", () => {
			expect(element.all(by.css(".accountMenuButton")).count()).to.eventually.equal(0);
		});
	
	});

	describe("should be present and", () => {

		before(() => {
			login();
		});
	
		after(() => {
			element.all(by.tagName("body")).first().click();
			logout();
		});

		it("visible in the account page", () => {
			expect(element(by.css(".accountMenuButton")).isDisplayed()).to.eventually.equal(true);
		});

		it("clickable in the account page", () => {
			element(by.css(".accountMenuButton")).click();
			expect(element(by.id("accountMenuContent")).isDisplayed()).to.eventually.equal(true);
		});

		describe("once opened", () => {

			it("should have the username at the top", () => {
				const content = element(by.id("accountMenuContent")).all(by.tagName("md-menu-item"));
				expect(content.count()).to.eventually.equal(4);
				expect(content.first().getText()).to.eventually.equal("account_circle\n" + USER.USERNAME);
			});

			it("should have a logout button", () => {
				expect(element(by.css('[ng-click="vm.logout()"]')).isDisplayed()).to.eventually.equal(true);
			});

			it("should have a teamspaces page button", () => {
				expect(element(by.css('[ng-click="vm.openUserManual()"]')).isDisplayed()).to.eventually.equal(true);
			});

			it("should have a teamspaces page button", () => {
				expect(element(by.css('[ng-click="vm.showTeamspaces()"]')).isDisplayed()).to.eventually.equal(true);
			});
			
		})

	});

});
