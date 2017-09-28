import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Billing page ", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the billing page content ", () => {

		it(" when we click on the billing page", () => {

			const billing = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
				return elem.getText().then(function(text) {
					return text === 'Billing';
				});
			});

			billing.click();
			expect(element(by.tagName("account-billing")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-billing")).isDisplayed()).to.eventually.equal(true);
		});

	});

});