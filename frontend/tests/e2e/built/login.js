"use strict";
exports.__esModule = true;
var protractor_1 = require("protractor");
require("mocha");
var chai = require("chai");
var chaiAsPromised = require("chai-as-promised");
var env = require("./environment");
// Necessary for async chai (eventually)
chai.use(chaiAsPromised);
var expect = chai.expect;
describe('Login page ', function () {
    beforeEach(function () {
        protractor_1.browser.get(env.url);
    });
    it('should have login box', function () {
        expect(protractor_1.browser.getTitle()).to.eventually.equal('3D Repo | Online BIM collaboration platform');
    });
});
