import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Terms page ", function() {

	this.timeout(6000);

	describe("should load the terms page ", () => {

		before(() => {
			browser.get(env.baseUrl + "/terms");
			browser.waitForAngular();
		})
		
		it("with the with the correct terms text", () => {
			expect(element(by.id("homeLegalContainer")).isPresent()).to.eventually.equal(true); 
			expect(element(by.tagName("terms")).isPresent()).to.eventually.equal(true);
			expect(element(by.id("legal")).isPresent()).to.eventually.equal(true);
			expect(element(by.id("legalText")).isPresent()).to.eventually.equal(true);
		});

	});

});