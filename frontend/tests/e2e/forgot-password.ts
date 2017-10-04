import { USER, browser, by, element , env, expect, logout } from "./config/imports";

describe("Forgot password page", function() {

	this.timeout(6000);
  
  before(() => {
    browser.get(env.baseUrl + "/passwordForgot");
    browser.waitForAngular();
  });

  describe("should have forgot password box", () => {

      const passwordBox = element(by.tagName("password-forgot"))

      it("with a container to hold inputs", () => {
          expect(passwordBox.isDisplayed()).to.eventually.equal(true);
      })

      it("with correct input boxes", () => {
        expect(element(by.model("vm.username")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.email")).isDisplayed()).to.eventually.equal(true);
      });

      it("with a forgot password button", () => {
        const button = element(by.css('[ng-click="vm.requestPasswordChange()"]'));
        expect(button.isDisplayed()).to.eventually.equal(true);
      });

  });

});