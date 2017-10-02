import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Cookies page ", function() {

	this.timeout(6000);

	describe("should load the cookies page ", () => {

		before(() => {
			browser.get(env.baseUrl + "/cookies");
			browser.waitForAngular();
		});
		
		after(() =>{
			browser.get(env.baseUrl);
			browser.waitForAngular();
		});
		
		it("with the correct cookies text", () => {
			expect(element(by.id("homeLegalContainer")).isPresent()).to.eventually.equal(true); 
			expect(element(by.tagName("cookies")).isPresent()).to.eventually.equal(true);
			expect(element(by.id("legal")).isPresent()).to.eventually.equal(true);
			expect(element(by.id("legalText")).isPresent()).to.eventually.equal(true);
		});

	});

});