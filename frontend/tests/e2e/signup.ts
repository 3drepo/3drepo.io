import { USER, browser, by, element , env, expect, logout } from "./config/imports";

describe("Sign up page ", () => {

  before(() => {
    browser.get(env.baseUrl + "/signUp");
  });

  describe("should have sign up box", () => {

      it("with a container to holder inputs", () => {
          expect(element(by.tagName("sign-up")).isPresent()).to.eventually.equal(true);
      })

      it("with correct input boxes", () => {
        expect(element(by.model("vm.newUser.username")).isPresent()).to.eventually.equal(true);
        expect(element(by.model("vm.newUser.password")).isPresent()).to.eventually.equal(true);
      });

      // it("with a terms and conidtions check box", () => {
      //   expect(true).to.equal(false);
      // });

      // it("with a sign up button", () => {
      //   expect(true).to.equal(false);
      // });

      // it("with a login link", () => {
      //   expect(true).to.equal(false);
      // });

      // it("with a pricing link", () => {
      //   expect(true).to.equal(false);
      // });

  });

});