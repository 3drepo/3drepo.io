import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Adding items", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("needs the teamspace page", () => {

		it("with button for adding projects, models and federations", () => {
			expect(element(by.id('addButtons')).isPresent()).to.eventually.equal(true);
		});

		it("with add button should show add menu and hide on second click", () => {
            
            element(by.id('addButtons')).click();
            expect(element(by.id("floating-button")).isDisplayed()).to.eventually.equal(true);
            expect(element(by.id("addModel")).isDisplayed()).to.eventually.equal(true);
            expect(element(by.id("addFederation")).isDisplayed()).to.eventually.equal(true);
            expect(element(by.id("addProject")).isDisplayed()).to.eventually.equal(true);
            
			element(by.id('addButtons')).click();
            expect(element(by.id("floating-button")).isDisplayed()).to.eventually.equal(false);
            expect(element(by.id("addModel")).isDisplayed()).to.eventually.equal(false);
            expect(element(by.id("addFederation")).isDisplayed()).to.eventually.equal(false);
            expect(element(by.id("addProject")).isDisplayed()).to.eventually.equal(false);
            
		});

		it("with a 'Add Model' button that opens a dialog on click", () => {
			
			element(by.id('addButtons')).click();
			element(by.id('addModel')).click();
			const dialog = element(by.className('newModelDialog'));
			expect(dialog.isDisplayed()).to.eventually.equal(true);

		});

		describe ("with the dialog open", () => {

			it("that has the correct fields", () => {
				
				const teamspace = element(by.model('vm.newModelData.teamspace'));
				const project = element(by.model('vm.newModelData.project'));
				expect(teamspace.isDisplayed()).to.eventually.equal(true);
				expect(project.isDisplayed()).to.eventually.equal(true);

			});

			it("with the teamspace defaulting to the test user name", () => {
				
				const menu = element.all(by.tagName('md-select'));
				expect(menu.count()).to.eventually.equal(2);
				expect(menu.get(0).getText()).to.eventually.equal(USER.USERNAME);

			});

			it("and you can change the project", () => {
				
				const menu = element.all(by.tagName('md-select'));
				menu.get(1).click();

				browser.sleep(1000);
				
				const select = element.all(by.css(".md-active"));

				const option = select.all(by.tagName("md-option")).get(0)
				option.click();

				const name = element(by.model('vm.newModelData.name'));
				expect(name.isDisplayed()).to.eventually.equal(true);
		
			});

			it("and you can save the model without uploading", () => {
				
				expect(element(by.model('vm.newModelData.name')).isDisplayed()).to.eventually.equal(true);
				element(by.model('vm.newModelData.name')).sendKeys("testmodel");
				element(by.css('[ng-click="vm.saveNewModel()"]')).click();
				
				const dialog = element.all(by.className('newModelDialog'));

				expect(dialog.count()).to.eventually.equal(0);

			});

		});

		
	});

});