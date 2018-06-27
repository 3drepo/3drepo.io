"use strict";
/**
 *  Copyright (C) 2014 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const expect = require("chai").expect;
const proxyquire = require("proxyquire").noCallThru();
const ModelHelper = proxyquire("../../../models/helper/model", {
	"../role": {},
	"../roleSetting": {},
	"../modelSetting": {},
	"../user": {},
	"../../response_codes": {},
	"../../services/queue": {},
	"../../constants": {},
	"../../mailer/mailer": {},
	"../../logger.js": {},
	"../../middlewares/middlewares": {},
	"../../config": {},
	"../../utils": {},
	"../history": {},
	"../scene": {},
	"../ref": {},
	"./stash": {},
	"../chatEvent": {},
	"../project": {}
});

describe("Model Helpers", function() {

	describe("#modelNameRegExp", function() {
		it("should have modelNameRegExp exposed", function() {
			expect(ModelHelper.modelNameRegExp).to.have.exist;
		});

		it("blank test model name format should fail", function() {
			expect(ModelHelper.modelNameRegExp.test("")).to.be.false;
		});

		it("plain test model name format should succeed", function() {
			expect(ModelHelper.modelNameRegExp.test("a")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("ab")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("abc")).to.be.true;
		});

		it("hyphens dashes and underscores in test model name format should succeed", function() {
			expect(ModelHelper.modelNameRegExp.test("123-4a")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("123_4a")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("123-_4A")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("aasa[")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("aasa/")).to.be.true;
			expect(ModelHelper.modelNameRegExp.test("aasa%")).to.be.true;
		});

		it("non-ASCII characters should fail", function() {
			expect(ModelHelper.modelNameRegExp.test("失败")).to.be.false;
			expect(ModelHelper.modelNameRegExp.test("😕")).to.be.false;
		});

		it("long strings less than 120 characters in test model name format should succeed", function() {
			expect(ModelHelper.modelNameRegExp.test("aaaaaaaaaaaaaaaaaaaaa")).to.be.true;
		});

		it("long strings more than 120 characters in test model name format should fail", function() {
			expect(ModelHelper.modelNameRegExp.test(
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaaaaaaaaaaaaa" +
				"aaaaaaaaaaaaaaaaa"
			)).to.be.false;
		});

	});

});
