import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Viewer page", function() {

	this.timeout(10000);

	before(() => {
        login();
        const EC = browser.ExpectedConditions;
        const url = env.baseUrl + "/" + USER.USERNAME + "/" + USER.MODEL_ID;
        browser.get(url);
        browser.waitForAngular();
        //browser.wait(EC.urlContains(USER.MODEL_ID), 10000); // Checks that the current URL contains the expected text
	});

	after(() => {
		logout();
	});

	describe("should load the model page elements ", () => {

		it("with the 3D Repo logo", () => {
			expect(element(by.id("homeLogo")).isPresent()).to.eventually.equal(true);
        });

        it("with the revisions drop down", () => {
			expect(element(by.tagName("revisions")).isPresent()).to.eventually.equal(true);
        });

        describe("with the left bottom buttons", () => {
            
            it("visible", () => {
                expect(element(by.id("leftButtons")).isPresent()).to.eventually.equal(true);
            });

        });

        describe("with the right side buttons", () => {

            it("visible", () => {
                expect(element(by.id("rightButtons")).isPresent()).to.eventually.equal(true);
            });

        });

        describe("with the left side buttons", () => {

            it("visible", () => {
                expect(element(by.id("buttons")).isPresent()).to.eventually.equal(true);                
            });
            
        });

        describe("with the issues list", () => {

            it("visible", () => {
                expect(element(by.tagName("panel-card")).isPresent()).to.eventually.equal(true);                
            });

        });
    
	});

});