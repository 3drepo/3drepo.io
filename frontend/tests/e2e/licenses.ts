import { USER, browser, by, element , env, expect, login, logout, hasClass} from "./config/imports";

describe("Licences page", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the licences page content", () => {

		it("when we click on the licences page", () => {

			const licences = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
				return elem.getText().then(function(text) {
					return text === 'Licences & Jobs';
				});
			});

			licences.click();
			expect(element(by.tagName("account-licenses")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-licenses")).isDisplayed()).to.eventually.equal(true);
		});

	});

	describe("it should have two tabs", () => {

		const tabs = element.all(by.tagName("md-tab-item"));

		it("including a licences tab", () => {
			expect(tabs.get(0).isDisplayed()).to.eventually.equal(true);
			expect(tabs.get(0).getText()).to.eventually.equal("LICENCES");
		});	

		it("including a jobs tab", () => {
			expect(tabs.get(1).isDisplayed()).to.eventually.equal(true);
			expect(tabs.get(1).getText()).to.eventually.equal("JOBS");
		});	

	});

	describe("it should have no current licences", () => {
		
		it("with text for the user to notify them", () => {
			const licenceText = element(by.css(".cardInfo"));
			expect(licenceText.isDisplayed()).to.eventually.equal(true);
			expect(licenceText.getText()).to.eventually.contain("You do not currently have any licences.");
		});	

	});
	

	describe("it should allow you to click on the jobs tab", () => {
		
		const tabs = element.all(by.tagName("md-tab-item"));
		
		it("correctly", () => {
			const jobsTab = tabs.get(1);
			expect(jobsTab.isDisplayed()).to.eventually.equal(true);
			jobsTab.click();
			expect(hasClass(jobsTab, "md-active")).to.eventually.equal(true);
		});	

		it("and have a add input", () => {
			const addJobInput = element(by.id("addJobInput"));
			expect(addJobInput.isDisplayed()).to.eventually.equal(true);
		});	

		it("and have a add button", () => {
			const addJobButton = element(by.id("addJob"));
			expect(addJobButton.isDisplayed()).to.eventually.equal(true);
		});	

	});

});