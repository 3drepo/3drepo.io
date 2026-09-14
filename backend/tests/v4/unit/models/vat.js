"use strict";

const vat = require("../../../../src/v4/models/vat");
describe("VAT", function() {

	describe("for business user", function() {

		const isBusiness = true;

		it("in UK should be 0.2", function() {
			expect(Math.abs((vat.getByCountryCode("GB", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
		});

		it("in other countries should be 0", function() {

			const otherEU = ["AT","BE","BG","CY","CZ","DE","DK","EE","GR","ES","FI","FR",
				"HR","HU","IE","IT","LT","LU","LV","MT","NL","PL","PT","RO",
				"SE","SI","SK"];

			otherEU.forEach(code => {
				expect(vat.getByCountryCode(code, isBusiness)).toBe(0);
			});

			expect(vat.getByCountryCode("HK", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("US", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("AU", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("NZ", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("CN", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("JP", isBusiness)).toBe(0);

		});

	});

	describe("for personal user", function() {

		const isBusiness = false;

		it("in UK should be 0.2", function() {
			expect(Math.abs((vat.getByCountryCode("GB", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
		});

		it("in other EU countries should be country-specific VAT", function() {

			expect(Math.abs((vat.getByCountryCode("AT", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("BE", isBusiness)) - (0.21))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("BG", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("CY", isBusiness)) - (0.19))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("CZ", isBusiness)) - (0.21))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("DE", isBusiness)) - (0.19))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("DK", isBusiness)) - (0.25))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("EE", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("GR", isBusiness)) - (0.23))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("ES", isBusiness)) - (0.21))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("FI", isBusiness)) - (0.24))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("FR", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("HR", isBusiness)) - (0.25))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("HU", isBusiness)) - (0.27))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("IE", isBusiness)) - (0.23))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("IT", isBusiness)) - (0.22))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("LT", isBusiness)) - (0.21))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("LU", isBusiness)) - (0.17))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("LV", isBusiness)) - (0.21))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("MT", isBusiness)) - (0.18))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("NL", isBusiness)) - (0.21))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("PL", isBusiness)) - (0.23))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("PT", isBusiness)) - (0.23))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("RO", isBusiness)) - (0.19))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("SE", isBusiness)) - (0.25))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("SI", isBusiness)) - (0.22))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("SK", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);
			expect(Math.abs((vat.getByCountryCode("GB", isBusiness)) - (0.2))).toBeLessThanOrEqual(Number.EPSILON);

		});

		it("in other places should be 0", function() {
			expect(vat.getByCountryCode("HK", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("US", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("AU", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("NZ", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("CN", isBusiness)).toBe(0);
			expect(vat.getByCountryCode("JP", isBusiness)).toBe(0);
		});
	});
});
