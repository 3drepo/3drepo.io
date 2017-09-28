import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Privacy page ", function() {

	this.timeout(6000);

	describe("should load the privacy page ", () => {

		before(() => {
			browser.get(env.baseUrl + "/privacy");
			browser.waitForAngular();
		})
		
		it("with the correct privacy text", () => {
			expect(element(by.id("homeLegalContainer")).isPresent()).to.eventually.equal(true); 
			expect(element(by.tagName("privacy")).isPresent()).to.eventually.equal(true);
			expect(element(by.id("legal")).isPresent()).to.eventually.equal(true);
			expect(element(by.id("legalText")).isPresent()).to.eventually.equal(true);
		});

	});

});