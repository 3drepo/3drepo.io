import { hasClass, USER, browser, by, element , env, expect, login, logout} from "./../config/imports";

describe("Home page", function() {

	this.timeout(6000);


	before(() => {
		browser.get(env.baseUrl + "/cookies");
		browser.waitForAngular();
	});

	it("should show the IE warning element when using IE", () => {

		expect(element(by.id("notSupported")).isDisplayed()).to.eventually.equal(true);

	});	

	it("should show links to modern browsers", () => {
		
		expect(element(by.id("notSupportedChrome")).isDisplayed()).to.eventually.equal(true);
		expect(element(by.id("notSupportedFirefox")).isDisplayed()).to.eventually.equal(true);
		expect(element(by.id("notSupportedEdge")).isDisplayed()).to.eventually.equal(true);

	});	

	it("should show the OK button", () => {
		
		expect(element(by.id("notSupportedButton")).isDisplayed()).to.eventually.equal(true);

	});	


});