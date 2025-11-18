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
const { createAppSync } = require("../../../src/v4/services/api.js");
const vat = require("../../../src/v4/models/vat");
const config = require("../../../src/v4/config");

describe("VAT from http://ec.europa.eu ", function () {

	let server;
	const skip = config && config.vat && config.vat.debug
					&& config.vat.debug.skipChecking;

	before(async function(done) {

		if (skip) {
			this.skip();
			done();
		} else {
			const app = await createAppSync();
			server = app.listen(8080, function () {
				console.log("API test server is listening on port 8080!");
				done();
			});
		}

	});

	after(function(done) {
		if (!skip) {
			server.close(function() {
				console.log("API test server is closed");
				done();
			});
		} else {
			done();
		}
	});

	it("checkVAT works correctly with valid code and VAT number", function(done) {

		vat.checkVAT("GB", "206909015").then(function(vatRes) {
			expect(vatRes).to.be.defined;
			expect(vatRes).to.have.property("valid");
			expect(vatRes.valid).to.equal(true);
			done();
		})
			.catch(function(err) {
				done(err);
			});

	});

	it("checkVAT passes correctly with non EU code and some valid looking VAT number", function(done) {

		// Mexico
		vat.checkVAT("MX", "P&G851223B24")
			.then(function(vatRes) {
				expect(vatRes).to.be.defined;
				expect(vatRes).to.have.property("valid");
				expect(vatRes.valid).to.equal(true);
				done();
			})
			.catch(function(err) {
				expect(err).to.be.undefined;
				done(err);
			});

	});

	it("checkVAT fails correctly with valid code and invalid VAT number", function(done) {

		vat.checkVAT("GB", "XXX")
			.then(function(vatRes) {
				expect(vatRes).to.be.defined;
				expect(vatRes).to.have.property("valid");
				expect(vatRes.valid).to.equal(false);
				done();
			})
			.catch(function(err) {
				console.log(err);
				expect(err).to.be.undefined;
				done(err);
			});

	});

	it("checkVAT fails with invalid code and a invalid VAT number", function(done) {

		vat.checkVAT("XXX", "XXX")
			.then(function(vatRes) {
				expect(vatRes).to.be.undefined;
				done();
			})
			.catch(function(err) {
				expect(err).to.be.defined;
				done();
			});

	});

});
