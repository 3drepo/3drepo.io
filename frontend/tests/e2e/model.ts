// import { USER, browser, by, element , env, expect, login, logout} from "./config/imports";

// describe("Model page ", function() {

// 	this.timeout(6000);

// 	before(() => {
// 		login();
// 		browser.get(env.baseUrl + "/" + USER.USERNAME + "/")
// 	});

// 	after(() => {
// 		logout();
// 	});

// 	describe("should load the account page content ", () => {

// 		it("with the 3D Repo logo", () => {
// 			expect(element(by.id("homeLogo")).isPresent()).to.eventually.equal(true);
// 		});

// 	});

// });