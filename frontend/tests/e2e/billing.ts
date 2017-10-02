import { hasClass, USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Billing page ", function() {

	this.timeout(6000);

	before(() => {
		login();
		const billing = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
			return elem.getText().then(function(text) {
				return text === 'Billing';
			});
		});

		billing.click();
	});

	after(() => {
		logout();
	});

	describe("should load the billing page content ", () => {

		it("when we click on the billing page", () => {

			expect(element(by.tagName("account-billing")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-billing")).isDisplayed()).to.eventually.equal(true);

		});
		
		describe("it should have a tabs holder ", () => {
			
			it("with two tabs with the correct text", () => {
				const tabs = element(by.tagName("md-tabs-canvas")).all(by.tagName("md-tab-item"))
				expect(tabs.count()).to.eventually.equal(2);
				expect(tabs.get(0).isDisplayed()).to.eventually.equal(true);
				expect(tabs.get(0).getText()).to.eventually.equal("SUBSCRIPTION");
				expect(tabs.get(1).isDisplayed()).to.eventually.equal(true);
				expect(tabs.get(1).getText()).to.eventually.equal("HISTORY");
			});	

			it("should start with the subscription tab", () => {
				const tabs = element(by.tagName("md-tabs-canvas")).all(by.tagName("md-tab-item"));
				hasClass(tabs.get(0), "md-active").then((answer) => {
					expect(answer).to.equal(true);
				});
			});	

			it("that work when you click on them", () => {
				const tabs = element(by.tagName("md-tabs-canvas")).all(by.tagName("md-tab-item"));
				tabs.get(1).click(); // HISTORY
				hasClass(tabs.get(1), "md-active").then((answer) => {
					expect(answer).to.equal(true);
				});
			});	

		});

		describe("subscription tab should be correct in form ", () => {
			
			it("with the correct input fields", () => {
				expect(element(by.model("vm.numNewLicenses")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.firstName")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.lastName")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.vat")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.line1")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.city")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.line2")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.postalCode")).isPresent()).to.eventually.equal(true);
				expect(element(by.model("vm.newBillingAddress.countryCode")).isPresent()).to.eventually.equal(true);
			});	

			it("with a confirm button", () => {
				const button = element(by.css(".accountBillingSave")).all(by.tagName("button"))
				expect(button.count()).to.eventually.equal(1);
			});	

			it("with a PayPal logo", () => {
				const logo = element(by.css(".accountBillingSave")).all(by.tagName("img"));
				expect(logo.count()).to.eventually.equal(1);
			});	

			it("with the consumer information", () => {
				const logo = element.all(by.css(".accountBillingAddressInfo"));
				expect(logo.count()).to.eventually.equal(3);
			});	

		});

		describe("history tab should be correct in form ", () => {
			
			it("with the table holder", () => {
				const tabs = element(by.tagName("md-tabs-canvas")).all(by.tagName("md-tab-item"));
				tabs.get(1).click(); // HISTORY
				expect(element(by.id("accountBillingHistory")).isPresent()).to.eventually.equal(true);
			});	

			it("with correct labels for the table", () => {
				const tabs = element(by.tagName("md-tabs-canvas")).all(by.tagName("md-tab-item"));
				tabs.get(1).click(); // HISTORY
				const labels = element(by.id("accountBillingHistory")).all(by.tagName("label"));
				expect(labels.count()).to.eventually.equal(6);
			});	

		});
		

	});

});