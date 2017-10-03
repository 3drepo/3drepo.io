import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Invalid pages", function() {

	this.timeout(10000);
	
	describe("whilst logged out", () => {
		
		it("should redirect to login page", () => {
			browser.get(env.baseUrl + "/invalid");
			const loginContainer = element(by.tagName("login"));
			expect(loginContainer.isPresent()).to.eventually.equal(true);
		});

	});

	// TODO: This doesn't work for some reason?
	describe("whilst logged in", () => {

		before(() => {
			login();
		})

		after(() => {
			logout();
		});
		
		it("should redirect to account page", () => {

			expect(element(by.id("accountItem")).isPresent()).to.eventually.equal(true);
			browser.get(env.baseUrl + "/invalid");
			expect(element(by.tagName("account-teamspaces")).isPresent()).to.eventually.equal(true);
			
		});

	});

});