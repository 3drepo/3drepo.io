
console.log("Importing e2e test dependencies...");
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import * as env from "./environment";

// Necessary for async chai (eventually)
chai.use(chaiAsPromised);
const expect = chai.expect;

// EXPORTS
export { }
export { USER } from "./user";
export { expect };
export { env };
export { ElementFinder, browser, by, element, ExpectedConditions } from "protractor";
export { login, logout, hasClass, clickElement } from "./helpers";