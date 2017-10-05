import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Licences page ", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the licences page content ", () => {

		it(" when we click on the licences page", () => {

			const licences = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
				return elem.getText().then(function(text) {
					return text === 'Licences';
				});
			});

			licences.click();
			expect(element(by.tagName("account-licenses")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-licenses")).isDisplayed()).to.eventually.equal(true);
		});

	});

	describe(" it should have no current licences", () => {
		
		it(" with text for the user to notify them", () => {
			const licenceText = element(by.css(".cardInfo"));
			expect(licenceText.isDisplayed()).to.eventually.equal(true);
			expect(licenceText.getText()).to.eventually.contain("You do not currently have any licences.");
		});	

	});
	

});