import { USER, browser, by, element , env, expect, login, logout, hasClass} from "./config/imports";

describe("Licences page ", function() {

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

		const tabs = element.all(by.tagName("md-tabs-item"));

		it("including a licences tab", () => {
			expect(tabs.get(0).isDisplayed()).to.eventually.equal(true);
			expect(tabs.get(0).getText()).to.eventually.equal("Licences");
		});	

		it("including a jobs tab", () => {
			expect(tabs.get(1).isDisplayed()).to.eventually.equal(true);
			expect(tabs.get(1).getText()).to.eventually.equal("Jobs");
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
		
		it("correctly", () => {
			const licenseTab = element(by.id("licenceJobs"));
			expect(licenseTab.isDisplayed()).to.eventually.equal(true);
			licenseTab.click();
			expect(hasClass(licenseTab, "md-active")).to.eventually.equal(true);
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