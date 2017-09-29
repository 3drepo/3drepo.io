import { USER, browser, by, element , env, expect, login, logout } from "./config/imports";

describe("Legal links", () => {

  before(() => {
    browser.get(env.baseUrl);
  });

  after(() => {
    logout();
  });

  describe("are visible logged out", () => {
    
      const legal = element(by.id("legalLinks"));

      it("with a holding box", () => {
        expect(legal.isDisplayed()).to.eventually.equal(true);
      });

      it("all the correct links", () => {
        expect(legal.all(by.linkText("Terms & Conditions")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Privacy")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
      });

  });

  describe("should exist if logged in", () => {

      const legal = element(by.id("legalLinks"));

      it("with a holding box", function() {
        this.timeout(6000);
        login();
        expect(legal.isDisplayed()).to.eventually.equal(true);
      });

      it("all the correct links", () => {
        expect(legal.all(by.linkText("Terms & Conditions")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Privacy")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
      });

  });

});