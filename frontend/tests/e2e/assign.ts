import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Assign page ", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the assign page content ", () => {

		it(" when we click on the assign page", () => {

			const assign = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
				return elem.getText().then(function(text) {
					return text === 'Assign Permissions';
				});
			});

			assign.click();
			expect(element(by.tagName("account-assign")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-assign")).isDisplayed()).to.eventually.equal(true);
		});

	});

});