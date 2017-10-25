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
            const revisions = element(by.tagName("revisions"));
            expect(revisions.isPresent()).to.eventually.equal(true);
            revisions.click();
            expect(element(by.repeater('rev in vm.revisions'))).to.eventually.equal(true);
            element(by.css('[ng-click="vm.closeDialog()"]')).click();
        });

        describe("with the left bottom buttons", () => {
            
            it("visible", () => {
                expect(element(by.id("leftButtons")).isPresent()).to.eventually.equal(true);
            });

        });

        describe("with the right bottom buttons", () => {

            it("visible", () => {
                expect(element(by.id("rightButtons")).isPresent()).to.eventually.equal(true);
            });

           
        });

        describe("with the left side buttons", () => {

            it("visible", () => {
                expect(element(by.id("buttons")).isPresent()).to.eventually.equal(true);                
            });
            
        });

        describe("with the right side buttons", () => {

            it("with a metadata button", () => {
                expect(element(by.id("metadataButton")).isPresent()).to.eventually.equal(true);
            });

            it("with a measure button", () => {
                expect(element(by.id("metadataButton")).isPresent()).to.eventually.equal(true);
            });

            it("click on the metadata button and it should be activated", () => {
                const meta = element(by.id("metadataButton"))
                const measure = element(by.id("measureButton"))
                meta.click();
                expect(meta.getCssValue('background-color')).to.eventually.equal('#FF9800');
                expect(measure.getCssValue('background-color')).to.eventually.equal('rgb(6,86,60)');
            });

            it("click on the measure button and it should be activated", () => {
                const measure = element(by.id("measureButton"))
                const meta = element(by.id("metadataButton"))
                measure.click();
                expect(meta.getCssValue('background-color')).to.eventually.equal('rgb(6,86,60)');
                expect(measure.getCssValue('background-color')).to.eventually.equal('#FF9800');
            });

        });

        describe("with the issues list", () => {

            it("visible", () => {
                expect(element(by.tagName("panel-card")).isPresent()).to.eventually.equal(true);                
            });

        });
    
	});

});