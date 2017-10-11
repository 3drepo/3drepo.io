import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Custom Login page ", function() {

	this.timeout(6000);

	describe("should load ", () => {

		before(() => {
			browser.get("http://test." + env.domain);
			browser.waitForAngular();
		});
		
		after(() =>{
			browser.get(env.baseUrl);
			browser.waitForAngular();
		});
		
		it("with the skeleton layout as expected", () => {

            expect(element(by.tagName("home")).isDisplayed()).to.eventually.equal(true);
            expect(element(by.tagName("login")).isDisplayed()).to.eventually.equal(true);
            
        });

        it("with the custom top logo", () => {

            const url = "http://test.127.0.0.1:8080/custom/test/images/test_logo.png";
            var image = element(by.id("homeLogo")).all(by.tagName("img")).first()
            expect(image.getAttribute("src")).to.eventually.equal(url);
            
        });

        it("with the custom top logo", () => {
            
            const url = "http://test.127.0.0.1:8080/custom/test/images/test_background.png";
            const image = element(by.className("homeContainer")).getCssValue("background-image");

            expect(image).to.eventually.equal('url("'+url+'")');
            
        });

        it("with the welcome message", () => {
            
            const test = element(by.className("welcome")).getText();
            expect(test).to.eventually.equal('Test!');
            
        });

        it("with custom CSS", () => {
            
            const url = "http://test.127.0.0.1:8080/custom/test/images/test_logo.png";
            var image = element(by.id("homeLogo")).all(by.tagName("img")).first().getCssValue("width");
            expect(image).to.eventually.equal("300px");
            
        });


	});

});