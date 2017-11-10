import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

describe("Profile page ", function() {

	this.timeout(6000);

	before(() => {
		login();
	});

	after(() => {
		logout();
	});

	describe("should load the profile page content ", () => {

		it(" when we click on the profile page", () => {

			const profile = element.all(by.repeater("(key, value) in vm.accountOptions")).filter(function(elem, index) {
				return elem.getText().then(function(text) {
					return text === 'Profile';
				});
			});

			profile.click();
			expect(element(by.tagName("account-profile")).isPresent()).to.eventually.equal(true);
			expect(element(by.tagName("account-profile")).isDisplayed()).to.eventually.equal(true);
		});

	});

});