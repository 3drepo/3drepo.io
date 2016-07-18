'use strict';

let chai = require("chai");
let expect = require('chai').expect;
let mongoose = require('mongoose');
let mockgoose = require('mockgoose');
let moment = require('moment');

mockgoose(mongoose);

let proxyquire = require('proxyquire').noCallThru();;


let Payment = proxyquire('../../../models/payment', {
	'paypal-rest-sdk': { configure: () => true },
	'../config' : { paypal: {}}
});


describe('Payment', function(){
	describe('.getNextPaymentDate', function(){

		it('should = 2016-02-01 if payment date is 2016-01-01', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-01-01')).toISOString()).to.equal('2016-02-01T00:00:00.000Z');
		});

		it('should = 2016-03-01 if payment date is 2016-01-30', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-01-30')).toISOString()).to.equal('2016-03-01T00:00:00.000Z');
		});

		it('should = 2016-03-01 if payment date is 2016-01-31', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-01-31')).toISOString()).to.equal('2016-03-01T00:00:00.000Z');
		});

		it('should = 2016-02-29 if payment date is 2016-01-29', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-01-29')).toISOString()).to.equal('2016-02-29T00:00:00.000Z');
		});

		it('should = 2016-02-28 if payment date is 2016-02-28', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-01-28')).toISOString()).to.equal('2016-02-28T00:00:00.000Z');
		});

		it('should = 2015-03-01 if payment date is 2015-01-29', function(){
			expect(Payment.getNextPaymentDate(new Date('2015-01-29')).toISOString()).to.equal('2015-03-01T00:00:00.000Z');
		});

		it('should = 2015-02-28 if payment date is 2015-01-28', function(){
			expect(Payment.getNextPaymentDate(new Date('2015-01-28')).toISOString()).to.equal('2015-02-28T00:00:00.000Z');
		});

		it('should = 2016-05-01 if payment date is 2016-03-31', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-03-31')).toISOString()).to.equal('2016-05-01T00:00:00.000Z');
		});

		it('should = 2016-08-31 if payment date is 2016-07-31', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-07-31')).toISOString()).to.equal('2016-08-31T00:00:00.000Z');
		});

		it('should = 2016-09-30 if payment date is 2016-08-30', function(){
			expect(Payment.getNextPaymentDate(new Date('2016-08-30')).toISOString()).to.equal('2016-09-30T00:00:00.000Z');
		});

	});

	describe('.getPaymentDateAndAmount', function(){

		it('business client from UK first time to buy 1 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let oldPayableLicences = [];
			
			let paymentDate = moment().utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(paymentDate.toDate());
			let country = 'GB';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, null, getNextPaymentDate, country, isBusiness);
			
			expect(dateAmountData.regularAmount).to.equal(100);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(83.33, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(16.67, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).to.equal(0);
			expect(dateAmountData.firstCycleBeforeTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleLength.value).to.equal(-1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});

		it('business client from UK first time to buy 3 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 3
			}];

			let oldPayableLicences = [];
			
			let paymentDate = moment().utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(paymentDate.toDate());
			let country = 'GB';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, null, getNextPaymentDate, country, isBusiness);
			
			expect(dateAmountData.regularAmount).to.equal(300);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(250, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(50, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).to.equal(0);
			expect(dateAmountData.firstCycleBeforeTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleLength.value).to.equal(-1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});


		it('business client from DE first time to buy 2 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let oldPayableLicences = [];
			
			let paymentDate = moment().utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(paymentDate.toDate());
			let country = 'DE';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, null, getNextPaymentDate, country, isBusiness);
			
			expect(dateAmountData.regularAmount).to.equal(200);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(200, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(0, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).to.equal(0);
			expect(dateAmountData.firstCycleBeforeTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleLength.value).to.equal(-1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});

		it('personal client from UK first time to buy 1 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let oldPayableLicences = [];
			
			let paymentDate = moment().utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(paymentDate.toDate());
			let country = 'GB';
			let isBusiness = false;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, null, getNextPaymentDate, country, isBusiness);
			
			expect(dateAmountData.regularAmount).to.equal(100);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(83.33, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(16.67, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).to.equal(0);
			expect(dateAmountData.firstCycleBeforeTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleLength.value).to.equal(-1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});

		it('personal client from DE first time to buy 2 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let oldPayableLicences = [];
			
			let paymentDate = moment().utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(paymentDate.toDate());
			let country = 'DE';
			let isBusiness = false;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, null, getNextPaymentDate, country, isBusiness);
			
			expect(dateAmountData.regularAmount).to.equal(200);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(168.07, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(31.93, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).to.equal(0);
			expect(dateAmountData.firstCycleBeforeTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleTaxAmount).to.equal(0);
			expect(dateAmountData.firstCycleLength.value).to.equal(-1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});


		it('business client from UK add 1 licence and my anniversary day is 31st Aug and I’m increasing licences on the 30th of Sep 1:30am', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let oldPayableLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];
			
			let lastAnniversaryDate = moment('2017-08-31').utc().startOf('date');
			let paymentDate = moment('2017-09-30').utc();

			let getNextPaymentDate = Payment.getNextPaymentDate(lastAnniversaryDate.toDate());
			let country = 'GB';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, lastAnniversaryDate, getNextPaymentDate, country, isBusiness);
	
			expect(dateAmountData.regularAmount).to.equal(400);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(333.33, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(66.67, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).closeTo(6.45, Number.EPSILON);
			expect(dateAmountData.firstCycleBeforeTaxAmount).closeTo(5.38, Number.EPSILON);
			expect(dateAmountData.firstCycleTaxAmount).closeTo(1.08, Number.EPSILON);
			expect(dateAmountData.firstCycleLength.value).to.equal(1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});



		it('business client from UK add 1 licence and my anniversary day is 31st Jan and I’m increasing licences on the 5th of February 2017', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let oldPayableLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];
			
			let lastAnniversaryDate = moment('2017-01-31').utc().startOf('date');
			let paymentDate = moment('2017-02-05').utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(lastAnniversaryDate.toDate());
			let country = 'GB';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, lastAnniversaryDate, getNextPaymentDate, country, isBusiness);

			expect(dateAmountData.regularAmount).to.equal(200);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(166.67, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(33.33, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).closeTo(82.76, Number.EPSILON);
			expect(dateAmountData.firstCycleBeforeTaxAmount).closeTo(68.97, Number.EPSILON);
			expect(dateAmountData.firstCycleTaxAmount).closeTo(13.79, Number.EPSILON);
			expect(dateAmountData.firstCycleLength.value).to.equal(24);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});


		it('business client from UK add 1 licence on the anniversary date', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let oldPayableLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];
			
			let lastAnniversaryDate = moment('2017-03-15').utc().startOf('date');
			let paymentDate = moment('2017-03-15').utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(lastAnniversaryDate.toDate());
			let country = 'GB';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, lastAnniversaryDate, getNextPaymentDate, country, isBusiness);

			expect(dateAmountData.regularAmount).to.equal(200);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(166.67, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(33.33, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).closeTo(100, Number.EPSILON);
			expect(dateAmountData.firstCycleBeforeTaxAmount).closeTo(83.33, Number.EPSILON);
			expect(dateAmountData.firstCycleTaxAmount).closeTo(16.67, Number.EPSILON);
			expect(dateAmountData.firstCycleLength.value).to.equal(31);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});


		it('business client from DE add 1 licence and my anniversary day is 31st and I’m increasing licences on the 5th of February 2017', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let oldPayableLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];
			
			let lastAnniversaryDate = moment('2017-01-31').utc().startOf('date');
			let paymentDate = moment('2017-02-05').utc();
			let getNextPaymentDate = Payment.getNextPaymentDate(lastAnniversaryDate.toDate());
			let country = 'DE';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, lastAnniversaryDate, getNextPaymentDate, country, isBusiness);

			expect(dateAmountData.regularAmount).to.equal(200);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(200, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(0, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).closeTo(82.76, Number.EPSILON);
			expect(dateAmountData.firstCycleBeforeTaxAmount).closeTo(82.76, Number.EPSILON);
			expect(dateAmountData.firstCycleTaxAmount).closeTo(0, Number.EPSILON);
			expect(dateAmountData.firstCycleLength.value).to.equal(24);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(paymentDate.toISOString());


		});


		it('business client from UK removing licences', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 0
			}];

			let oldPayableLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];
			
			let lastAnniversaryDate = moment('2017-03-15').utc().startOf('date');
			let paymentDate = moment('2017-03-28').utc();
			let getNextPaymentDate = moment(lastAnniversaryDate);
			let country = 'GB';
			let isBusiness = true;

			let dateAmountData = Payment.getPaymentDateAndAmount(newLicences, oldPayableLicences, paymentDate, lastAnniversaryDate, getNextPaymentDate, country, isBusiness);

			expect(dateAmountData.regularAmount).to.equal(200);
			expect(dateAmountData.regularBeforeTaxAmount).to.closeTo(166.67, Number.EPSILON);
			expect(dateAmountData.regularTaxAmount).to.closeTo(33.33, Number.EPSILON);
			expect(dateAmountData.firstCycleAmount).closeTo(0, Number.EPSILON);
			expect(dateAmountData.firstCycleBeforeTaxAmount).closeTo(0, Number.EPSILON);
			expect(dateAmountData.firstCycleTaxAmount).closeTo(0, Number.EPSILON);
			expect(dateAmountData.firstCycleLength.value).to.equal(-1);
			expect(dateAmountData.firstCycleLength.unit).to.equal('DAY');
			expect(dateAmountData.regularCycleLength.value).to.equal(1);
			expect(dateAmountData.regularCycleLength.unit).to.equal('MONTH');
			expect(dateAmountData.startDate.toISOString()).to.equal(getNextPaymentDate.toISOString());


		});
	});
});
