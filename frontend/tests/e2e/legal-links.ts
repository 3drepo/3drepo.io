import { USER, browser, by, element , env, expect, login, logout } from "./config/imports";

describe("Legal links", function() {
  
  this.timeout(6000);
	
  describe("are visible logged out", () => {

      before(() => {
        browser.get(env.baseUrl);
      });
    
      it("with a holding box", () => {
        const legal = element(by.id("legalLinks"));        
        expect(legal.isDisplayed()).to.eventually.equal(true);
      });

      it("all the correct links", () => {
        const legal = element(by.id("legalLinks"));        
        expect(legal.all(by.linkText("Terms & Conditions")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Privacy")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
      });

  });

  describe("should exist if logged in", () => {

      before(() => {
        login();
      })

      after(() => {
        logout();
      })

      it("with a holding box", function() {
        this.timeout(6000);
        const legal = element(by.id("legalLinks"));
        expect(legal.isDisplayed()).to.eventually.equal(true);
      });

      it("all the correct links", () => {
        const legal = element(by.id("legalLinks"));
        expect(legal.all(by.linkText("Terms & Conditions")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Privacy")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Pricing")).first().isDisplayed()).to.eventually.equal(true);
        expect(legal.all(by.linkText("Cookies")).first().isDisplayed()).to.eventually.equal(true);
      });

  });

});