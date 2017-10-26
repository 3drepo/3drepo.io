import { USER, browser, by, element , env, expect, login, logout, ExpectedConditions, clickElement} from "./config/imports";

describe("Viewer page", function() {

	this.timeout(60000 * 2);

	before(() => {
        login();
        const EC = browser.ExpectedConditions;
        const url = env.baseUrl + "/" + USER.USERNAME + "/" + USER.MODEL_ID;
        browser.get(url);
        browser.waitForAngular();

 
        browser.wait(
            ExpectedConditions.invisibilityOf(element(by.className("loadingViewerText"))), 
            30000
        )

        browser.sleep(20000);

	});

	after(() => {
		logout();
	});

	describe("should load the model page elements ", () => {

		it("with the 3D Repo logo", () => {
			expect(element(by.id("homeLogo")).isDisplayed()).to.eventually.equal(true);
        });

        it("with the revisions drop down", () => {
            const revisions = element(by.tagName("revisions"));
            expect(revisions.isDisplayed()).to.eventually.equal(true);
            revisions.click();
            expect(element(by.repeater('rev in vm.revisions')).isDisplayed()).to.eventually.equal(true);
            element(by.css('[ng-click="vm.closeDialog()"]')).click();
        });

        describe("with the left bottom buttons", () => {
            
            it("visible", () => {
                expect(element(by.id("leftButtons")).isDisplayed()).to.eventually.equal(true);
            });

        });

        describe("with the right bottom buttons", () => {

            it("visible", () => {
                expect(element(by.id("rightButtons")).isDisplayed()).to.eventually.equal(true);
            });

        });

        describe("with the model loaded", () => {
            
            describe("the left side buttons", () => {
    
                it("visible", () => {
                    expect(element(by.id("issuesLeftButton")).isDisplayed()).to.eventually.equal(true); 
                    expect(element(by.id("treeLeftButton")).isDisplayed()).to.eventually.equal(true); 
                    expect(element(by.id("clipLeftButton")).isDisplayed()).to.eventually.equal(true); 
                });
    
                it("and clicking the issues button should hide and show issues panel", () => {
    
                    // Shown by default
                    const issuesButton = element(by.id("issuesLeftButton"))
    
                    expect(element(by.id("issuesPanel")).isDisplayed()).to.eventually.equal(true);
                    issuesButton.click();
                    expect(element(by.id("issuesPanel")).isDisplayed()).to.eventually.equal(false);          
    
                });
    
                it("and clicking the tree button should hide and show tree panel", () => {
    
                    const treeButton = element(by.id("treeLeftButton"));
    
                    expect(element(by.id("treePanel")).isDisplayed()).to.eventually.equal(false);
                    treeButton.click();
                    expect(element(by.id("treePanel")).isDisplayed()).to.eventually.equal(true);
                    treeButton.click();
                    expect(element(by.id("treePanel")).isDisplayed()).to.eventually.equal(false);
    
                });
    
                it("and clicking the clip button should hide and show clip panel", () => {
                    
                    const clipButton = element(by.id("clipLeftButton"));
    
                    expect(element(by.id("clipPanel")).isDisplayed()).to.eventually.equal(false);
                    clipButton.click();
                    expect(element(by.id("clipPanel")).isDisplayed()).to.eventually.equal(true);
                    clipButton.click();
                    expect(element(by.id("clipPanel")).isDisplayed()).to.eventually.equal(false);
    
                });
                
            });
    
            describe("with the right side buttons", () => {
                const orange = 'rgba(255, 152, 0, 1)';
                const green = 'rgba(6, 86, 60, 1)';
    
                it("with a metadata button", () => {
                    expect(element(by.id("metadataButton")).isDisplayed()).to.eventually.equal(true);
                });
    
                it("with a measure button", () => {
                    expect(element(by.id("metadataButton")).isDisplayed()).to.eventually.equal(true);
                });
    
                it("click on the metadata button and it should be activated", () => {
                    
                    const meta = element(by.id("metadataButton"))
                    const measure = element(by.id("measureButton"))
                    meta.click();

                    expect(meta.getCssValue('background-color')).to.eventually.equal(orange);
                    expect(measure.getCssValue('background-color')).to.eventually.equal(green);

                });

                // Won't run on CI :( probably because there is no graphics card?

                // it("should open metadata panel on clicking on the center of the model", () => {
                    
                //     const canvas = element(by.id("canvas"))
                //     const size = canvas.getSize()
                //     expect(size).to.eventually.haveOwnProperty("width")
                //     expect(size).to.eventually.haveOwnProperty("height")
                //     expect(clickElement(canvas, size)).to.eventually.exist
                //     expect(element(by.id('docsPanel')).isDisplayed()).to.eventually.equal(true);
                       
                // });
    
                it("click on the measure button and it should be activated", () => {
                    const measure = element(by.id("measureButton"))
                    const meta = element(by.id("metadataButton"))
                    measure.click();
                    expect(meta.getCssValue('background-color')).to.eventually.equal(green);
                    expect(measure.getCssValue('background-color')).to.eventually.equal(orange);
                });
    
            });

            describe("with an issues panel that", () => {

                it("allows to click on the top issue", () => {

                    const issuesButton = element(by.id("issuesLeftButton"))
                    issuesButton.click();
                    expect(element(by.id("issuesPanel")).isDisplayed()).to.eventually.equal(true);

                    const issues = element.all(by.tagName("issues-list-item"));
                    issues.first().click();
                    const arrow = element(by.id("issuesListItemEnter"));
                    expect(arrow.isDisplayed()).to.eventually.equal(true);

                });

            }); 
            

        });

	});

});