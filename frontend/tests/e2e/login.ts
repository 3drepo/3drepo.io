import { USER, browser, by, element , env, expect, logout } from "./config/imports";

describe("Login page ", () => {

  before(() => {
    browser.get(env.baseUrl);
  });

  after(() => {
    logout();
  })

  describe("should have login box", () => {

      it("with a correct title", () => {
        expect(browser.getTitle()).to.eventually.equal("3D Repo | Online BIM collaboration platform");
      });

      it("with the 3D Repo logo", () => {
        expect(element(by.id("homeLogo")).isPresent()).to.eventually.equal(true);
      });

      it("with a welcome message", () => {
        expect(element(by.css(".welcome")).isPresent()).to.eventually.equal(true);
      });

      it("with a login button", () => {
        expect(element(by.css(".loginButton")).isPresent()).to.eventually.equal(true);
      });

      it("with username and password fields bound to a model", () => {
        expect(element(by.model("vm.user.username")).isPresent()).to.eventually.equal(true);
        expect(element(by.model("vm.user.password")).isPresent()).to.eventually.equal(true);
      });

  });

  describe("should login correctly", () => {

      it("when username and password are inserted", function() {
        this.timeout(6000);
        
        element(by.model("vm.user.username")).sendKeys(USER.USERNAME)
        element(by.model("vm.user.password")).sendKeys(USER.PASSWORD);
        element(by.css(".loginButton")).click();
        expect(element(by.id("accountItem")).isPresent()).to.eventually.equal(true);
        expect(element(by.tagName("account-teamspaces")).isPresent()).to.eventually.equal(true);

      });

  });

});