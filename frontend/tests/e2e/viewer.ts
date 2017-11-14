import { USER, browser, by, element , env, expect, login, logout, ExpectedConditions, clickElement} from "./config/imports";

describe("Viewer page", function() {

    this.timeout(60000 * 2);

	before(() => {
        login();
        const EC = browser.ExpectedConditions;
        const url = env.baseUrl + "/" + USER.USERNAME + "/" + USER.MODEL_ID;
        browser.get(url);
        browser.waitForAngular();
	});

	after(() => {
		logout();
	});

	describe("should load the model page elements ", () => {

		it("with the 3D Repo logo", () => {
			expect(element(by.id("homeLogo")).isDisplayed()).to.eventually.equal(true);
        });

        describe("with the left bottom buttons", () => {
            
            it("visible", () => {
                expect(element(by.id("leftButtons")).isDisplayed()).to.eventually.equal(true);
            });

        });

        describe("with the legal links", () => {
            
            it("visible", () => {
                expect(element(by.id("legalLinks")).isDisplayed()).to.eventually.equal(true);
            });

        });

        describe("with the account menu", () => {

            it("visible", () => {
                expect(element(by.tagName("account-menu")).isDisplayed()).to.eventually.equal(true);
            });
           
        })

        describe("with the right bottom buttons", () => {

            it("visible", () => {
                expect(element(by.id("rightButtons")).isDisplayed()).to.eventually.equal(true);
            });

        });

        describe("left side buttons", () => {
            it("visible", () => {
                expect(element(by.id("issuesLeftButton")).isDisplayed()).to.eventually.equal(true); 
                expect(element(by.id("treeLeftButton")).isDisplayed()).to.eventually.equal(true); 
                expect(element(by.id("clipLeftButton")).isDisplayed()).to.eventually.equal(true); 
            });
        })

        describe("right side buttons", () => {
            it("with a visible metadata button", () => {
                expect(element(by.id("metadataButton")).isDisplayed()).to.eventually.equal(true);
            });

            it("with a visible measure button", () => {
                expect(element(by.id("metadataButton")).isDisplayed()).to.eventually.equal(true);
            });
        })

        describe("viewer", () => {
            
            it("visible", () => {
                expect(element(by.tagName("viewer")).isDisplayed()).to.eventually.equal(true);
            });

        })

        describe("loading text", () => {
            
            it("to exist", () => {
                expect(element(by.className("loadingViewer")).isDisplayed()).to.eventually.equal(true);
                expect(element(by.className("loadingViewerText")).isDisplayed()).to.eventually.equal(true);
            });

        })

        describe("with the model loaded", () => {

            before(() => {

                browser.wait(
                    ExpectedConditions.elementToBeClickable(element(by.id("addIssue"))),
                    60000 * 2
                );        

            });

            it("with the revisions drop down", () => {
                const revisions = element(by.tagName("revisions"));
                expect(revisions.isDisplayed()).to.eventually.equal(true);
                revisions.click();
                expect(element(by.repeater('rev in vm.revisions')).isDisplayed()).to.eventually.equal(true);
                element(by.css('[ng-click="vm.closeDialog()"]')).click();
            });
            
            describe("and interacting with the left side buttons", () => {
    
                it("by clicking the issues button should hide and show issues panel", () => {
    
                    // Shown by default
                    const issuesButton = element(by.id("issuesLeftButton"))
    
                    expect(element(by.id("issuesPanel")).isDisplayed()).to.eventually.equal(true);
                    issuesButton.click();
                    expect(element(by.id("issuesPanel")).isDisplayed()).to.eventually.equal(false);          
    
                });
    
                it("by clicking the tree button should hide and show tree panel", () => {
    
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
    
            describe("and interacting with the right side buttons", () => {

                const orange = 'rgba(255, 152, 0, 1)';
                const green = 'rgba(6, 86, 60, 1)';
    
                it("by clicking on the metadata button should be activate it", () => {
                    
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
    
                it("by clicking on the measure button should activate it", () => {
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

                    const issues = element.all(by.className("issueListItem"));
                    expect(issues.count()).to.eventually.be.greaterThan(0);

                    issues.first().click();
                    const arrow = element(by.id("issuesListItemEnter"));
                    expect(arrow.isDisplayed()).to.eventually.equal(true);

                });

                it("the top issue opens correctly", () => {
                
                    const arrow = element(by.id("issuesListItemEnter"));
                    arrow.click();
                    expect(element(by.id("issueTitleArea")).isDisplayed()).to.eventually.equal(true);
                    expect(element(by.id("issueInfoArea")).isDisplayed()).to.eventually.equal(true);
                    expect(element(by.id("issueAdditional")).isDisplayed()).to.eventually.equal(true);
                    expect(element.all(by.className("issueThumbnailImage")).count()).to.eventually.greaterThan(0)
                    expect(element(by.id("submitCommentButton")).isDisplayed()).to.eventually.equal(true);
                    expect(element(by.id("screenshotCommentButton")).isDisplayed()).to.eventually.equal(true);

                });

                describe("allows you to add a comment", () => {
                    
                    it("with some custom text", () => {
                        
                        const comment = element(by.id("newCommentInput"));
                        comment.sendKeys("A new comment");

                    });

                    it("with a screenshot", () => {

                        element(by.id("screenshotCommentButton")).click();
                        expect(element(by.id("scribbleCanvas")).isDisplayed()).to.eventually.equal(true);
                        expect(element(by.id("saveCommentScreenshot")).isDisplayed()).to.eventually.equal(true);
                        element(by.id("saveCommentScreenshot")).click();

                    })

                    it("and when filled in should be saveable", () => {

                        expect(element.all(by.id("scribbleCanvas")).count()).to.eventually.equal(0);
                        expect(element(by.id("commentThumbnail")).isDisplayed()).to.eventually.equal(true);
                        expect(element(by.id("submitCommentButton")).isDisplayed()).to.eventually.equal(true);
                        element(by.id("submitCommentButton")).click();
                        expect(element.all(by.className("issueComment")).count()).to.eventually.greaterThan(1);
             
                    });
 
                });

                describe("allows you to change the details", () => {
                    
                    it("including priority", () => {
                        
                        const menu = element(by.id('issuePriority'));
                        menu.click();
                        browser.sleep(1000);
                        
                        const high = element.all(by.repeater('priority in vm.priorities')).get(0);
                        high.click();

                        const text = menu.all(by.tagName("md-select-value")).first().getText();
                        expect(text).to.eventually.equal("None");
                       
                    });

                    it("including status", () => {

                        const menu = element(by.id('issueStatus'));
                        menu.click();
                        browser.sleep(1000);
                        
                        const high = element.all(by.repeater('status in vm.statuses')).get(0);
                        high.click();

                        const text = menu.all(by.tagName("md-select-value")).first().getText()
                        expect(text).to.eventually.equal("Open");

                    })

                    it("including assign", () => {

                        const menu = element(by.id('issueAssign'));
                        menu.click();
                        browser.sleep(1000);
                        
                        const high = element.all(by.repeater('job in vm.modelJobs')).get(0);
                        high.click();

                        const text = menu.all(by.tagName("md-select-value")).first().getText()
                        expect(text).to.eventually.equal("Client");
             
                    });

                    it("including type", () => {
                    
                        const menu = element(by.id('issueType'));
                        menu.click();
                        browser.sleep(1000);
                        
                        const high = element.all(by.repeater('type in vm.topic_types')).get(0);
                        high.click();

                        const text = menu.all(by.tagName("md-select-value")).first().getText()
                        expect(text).to.eventually.equal("For information");
                
                    });

                        
                });

            }); 
            

        });

	});

});