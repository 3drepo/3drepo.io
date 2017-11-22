import { USER, browser, by, element , env, expect, logout } from "./config/imports";

describe("Sign up page ", () => {

  before(() => {
    browser.get(env.baseUrl + "/signUp");
  });

  describe("should have sign up box", () => {

      const checkbox = element(by.tagName("sign-up"))

      it("with a container to holder inputs", () => {
          expect(checkbox.isDisplayed()).to.eventually.equal(true);
      })

      it("with correct input boxes", () => {
        expect(element(by.model("vm.newUser.username")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.password")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.firstName")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.lastName")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.email")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.phoneNo")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.company")).isDisplayed()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.jobTitle")).isDisplayed()).to.eventually.equal(true);
      });

      it("with a terms and conditions check box", () => {
        expect(checkbox.all(by.id("tc")).count()).to.eventually.equal(1);
        expect(checkbox.all(by.id("tc")).first().isDisplayed()).to.eventually.equal(true);
      });

      it("with a sign up button", () => {
        expect(checkbox.all(by.css(".sign-up-button")).count()).to.eventually.equal(1);
        expect(checkbox.all(by.css(".sign-up-button")).first().isDisplayed()).to.eventually.equal(true);
      });

      it("with a Log in link", () => {
        expect(checkbox.all(by.css(".logIn")).count()).to.eventually.equal(1);
        expect(checkbox.all(by.css(".logIn")).first().isDisplayed()).to.eventually.equal(true);
      });

      it("with a Pricing link", () => {
        expect(checkbox.all(by.css(".pricing")).count()).to.eventually.equal(1);
        expect(checkbox.all(by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
      });

      it("trying to login without any field filled in fails", () => {
        element(by.css('[ng-click="vm.register()"]')).click();
        const error = element(by.css(".registerError"));
        expect(error.isDisplayed()).to.eventually.equal(true);
        expect(error.getText()).to.eventually.equal("Please fill all required fields");
      });

  });

});