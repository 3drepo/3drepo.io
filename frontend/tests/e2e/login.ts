import { ElementFinder, browser, by, element } from 'protractor';
import 'mocha';
import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as env from './environment';

// Necessary for async chai (eventually)
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Login page ', () => {
  beforeEach(() => {
    browser.get(env.url);
  });

  it('should have login box', () => {

      expect(browser.getTitle()).to.eventually.equal('3D Repo | Online BIM collaboration platform');

  });

});