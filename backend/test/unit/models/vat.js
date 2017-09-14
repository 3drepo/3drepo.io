'use strict';

let vat = require('../../../models/vat');
let chai = require("chai");
let expect = require('chai').expect;

describe('VAT', function(){

	describe('for business user', function(){

		let isBusiness = true;

		it('in UK should be 0.2', function(){
			expect(vat.getByCountryCode('GB', isBusiness)).to.closeTo(0.2, Number.EPSILON);
		});

		it('in other countries should be 0', function(){

			let otherEU = ['AT','BE','BG','CY','CZ','DE','DK','EE','GR','ES','FI','FR',
			'HR','HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO',
			'SE','SI','SK'];

			otherEU.forEach(code => {
				expect(vat.getByCountryCode(code, isBusiness)).to.equal(0);
			});

			expect(vat.getByCountryCode('HK', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('US', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('AU', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('NZ', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('CN', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('JP', isBusiness)).to.equal(0);


		});


	});

	describe('for personal user', function(){

		let isBusiness = false;

		it('in UK should be 0.2', function(){
			expect(vat.getByCountryCode('GB', isBusiness)).to.closeTo(0.2, Number.EPSILON);
		});

		it('in other EU countries should be country-specific VAT', function(){

			expect(vat.getByCountryCode('AT', isBusiness)).to.closeTo(0.2, Number.EPSILON);
			expect(vat.getByCountryCode('BE', isBusiness)).to.closeTo(0.21, Number.EPSILON);
			expect(vat.getByCountryCode('BG', isBusiness)).to.closeTo(0.2, Number.EPSILON);
			expect(vat.getByCountryCode('CY', isBusiness)).to.closeTo(0.19, Number.EPSILON);
			expect(vat.getByCountryCode('CZ', isBusiness)).to.closeTo(0.21, Number.EPSILON);
			expect(vat.getByCountryCode('DE', isBusiness)).to.closeTo(0.19, Number.EPSILON);
			expect(vat.getByCountryCode('DK', isBusiness)).to.closeTo(0.25, Number.EPSILON);
			expect(vat.getByCountryCode('EE', isBusiness)).to.closeTo(0.2, Number.EPSILON);
			expect(vat.getByCountryCode('GR', isBusiness)).to.closeTo(0.23, Number.EPSILON);
			expect(vat.getByCountryCode('ES', isBusiness)).to.closeTo(0.21, Number.EPSILON);
			expect(vat.getByCountryCode('FI', isBusiness)).to.closeTo(0.24, Number.EPSILON);
			expect(vat.getByCountryCode('FR', isBusiness)).to.closeTo(0.2, Number.EPSILON);
			expect(vat.getByCountryCode('HR', isBusiness)).to.closeTo(0.25, Number.EPSILON);
			expect(vat.getByCountryCode('HU', isBusiness)).to.closeTo(0.27, Number.EPSILON);
			expect(vat.getByCountryCode('IE', isBusiness)).to.closeTo(0.23, Number.EPSILON);
			expect(vat.getByCountryCode('IT', isBusiness)).to.closeTo(0.22, Number.EPSILON);
			expect(vat.getByCountryCode('LT', isBusiness)).to.closeTo(0.21, Number.EPSILON);
			expect(vat.getByCountryCode('LU', isBusiness)).to.closeTo(0.17, Number.EPSILON);
			expect(vat.getByCountryCode('LV', isBusiness)).to.closeTo(0.21, Number.EPSILON);
			expect(vat.getByCountryCode('MT', isBusiness)).to.closeTo(0.18, Number.EPSILON);
			expect(vat.getByCountryCode('NL', isBusiness)).to.closeTo(0.21, Number.EPSILON);
			expect(vat.getByCountryCode('PL', isBusiness)).to.closeTo(0.23, Number.EPSILON);
			expect(vat.getByCountryCode('PT', isBusiness)).to.closeTo(0.23, Number.EPSILON);
			expect(vat.getByCountryCode('RO', isBusiness)).to.closeTo(0.19, Number.EPSILON);
			expect(vat.getByCountryCode('SE', isBusiness)).to.closeTo(0.25, Number.EPSILON);
			expect(vat.getByCountryCode('SI', isBusiness)).to.closeTo(0.22, Number.EPSILON);
			expect(vat.getByCountryCode('SK', isBusiness)).to.closeTo(0.2, Number.EPSILON);
			expect(vat.getByCountryCode('GB', isBusiness)).to.closeTo(0.2, Number.EPSILON);
			
		});

		it('in other places should be 0', function(){
			expect(vat.getByCountryCode('HK', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('US', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('AU', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('NZ', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('CN', isBusiness)).to.equal(0);
			expect(vat.getByCountryCode('JP', isBusiness)).to.equal(0);
		})
	});
});