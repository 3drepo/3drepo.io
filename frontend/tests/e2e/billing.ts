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
		

		describe(" it should have a tabs holder", () => {
			
			it(" with two tabs with the correct text", () => {
				const tabs = element(by.tagName("md-tabs-canvas")).all(by.tagName("md-tab-item"))
				expect(tabs.count()).to.eventually.equal(2);
				expect(tabs.get(0).getText()).to.eventually.equal("Subscription");
				expect(tabs.get(0).isDisplayed()).to.eventually.equal("Subscription");
				expect(tabs.get(1).getText()).to.eventually.equal("History");
				expect(tabs.get(1).isDisplayed()).to.eventually.equal("History");
			});	

		});
		

	});

});