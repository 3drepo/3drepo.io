'use strict';

let chai = require("chai");
let expect = require('chai').expect;
let moment = require('moment');
let proxyquire = require('proxyquire').noCallThru();
let sinon = require('sinon');

let UserBilling = proxyquire('../../../models/userBilling', {
	"./subscriptions": {},
	"./billingAddress": {},
	"./paypal.js": {},
	"./invoice.js": {},
	"../response_codes.js": {},
	"./counter": {},
	'./role': {},
	'../mailer/mailer': {},
	'./user': {}
});

let Subscriptions = proxyquire('../../../models/subscriptions', {
	'./projectSetting' :  {}
});

let C = require('../../../constants');

describe('UserBilling', function(){

	describe('.getNextPaymentDate', function(){

		it('should = 2016-02-01 if payment date is 2016-01-01', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-01-01')).toISOString()).to.equal('2016-02-01T00:00:00.000Z');
		});

		it('should = 2016-03-01 if payment date is 2016-01-30', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-01-30')).toISOString()).to.equal('2016-03-01T00:00:00.000Z');
		});

		it('should = 2016-03-01 if payment date is 2016-01-31', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-01-31')).toISOString()).to.equal('2016-03-01T00:00:00.000Z');
		});

		it('should = 2016-02-29 if payment date is 2016-01-29', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-01-29')).toISOString()).to.equal('2016-02-29T00:00:00.000Z');
		});

		it('should = 2016-02-28 if payment date is 2016-02-28', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-01-28')).toISOString()).to.equal('2016-02-28T00:00:00.000Z');
		});

		it('should = 2015-03-01 if payment date is 2015-01-29', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2015-01-29')).toISOString()).to.equal('2015-03-01T00:00:00.000Z');
		});

		it('should = 2015-02-28 if payment date is 2015-01-28', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2015-01-28')).toISOString()).to.equal('2015-02-28T00:00:00.000Z');
		});

		it('should = 2016-05-01 if payment date is 2016-03-31', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-03-31')).toISOString()).to.equal('2016-05-01T00:00:00.000Z');
		});

		it('should = 2016-08-31 if payment date is 2016-07-31', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-07-31')).toISOString()).to.equal('2016-08-31T00:00:00.000Z');
		});

		it('should = 2016-09-30 if payment date is 2016-08-30', function(){
			expect(UserBilling.statics.getNextPaymentDate(new Date('2016-08-30')).toISOString()).to.equal('2016-09-30T00:00:00.000Z');
		});

	});


	function createPaymentTest(data){

		let subscriptions = new Subscriptions('', '', {}, data.currentSubscriptions);

		subscriptions.now = data.paymentDate.toDate();
		

		let stub = sinon.stub(subscriptions, 'removeSubscriptionByPlan').returns(Promise.resolve());

		return subscriptions.changeSubscriptions(data.newLicences).then(changes => {

			let instanceProp = {
				subscriptions,
				billingInfo: {
					countryCode: data.country,
					vat: data.isBusiness ? 'ABC123' : null
				}
			}

			if(data.lastAnniversaryDate){
				instanceProp.lastAnniversaryDate = data.lastAnniversaryDate.toDate();
				instanceProp.nextPaymentDate =  data.nextPaymentDate;
			}

			let paymentData = UserBilling.methods.calculateAmounts.call(instanceProp, data.paymentDate, changes);

			let proRataPayment = paymentData.payments.find(payment => payment.type === C.PRO_RATA_PAYMENT);
			let regularPayment = paymentData.payments.find(payment => payment.type === C.REGULAR_PAYMENT);
			
			stub.restore();

			return {changes, proRataPayment, regularPayment, paymentDate: paymentData.paymentDate};
		});
	}

	describe('send correct payment info to paypal given old and new licences information', function(){

		it('business client from UK first time to buy 1 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let currentSubscriptions = [];
			
			let paymentDate = moment().utc();
			let country = 'GB';
			let isBusiness = true;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({	 
					proRataPeriodPlans: [],
					regularPeriodPlans: newLicences,
					canceledAllPlans: false 
				});
				expect(result.regularPayment.gross).to.equal(120);
				expect(result.regularPayment.net).to.closeTo(100, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(20, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');
				expect(result.proRataPayment).to.not.exists;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it('business client from UK first time to buy 3 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 3
			}];

			let currentSubscriptions = [];
			
			let paymentDate = moment().utc();
			let country = 'GB';
			let isBusiness = true;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({	 
					proRataPeriodPlans: [],
					regularPeriodPlans: newLicences,
					canceledAllPlans: false 
				});
				expect(result.regularPayment.gross).to.equal(360);
				expect(result.regularPayment.net).to.closeTo(300, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(60, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');
				expect(result.proRataPayment).to.not.exists;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});


		it('business client from DE first time to buy 2 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let currentSubscriptions = [];
			
			let paymentDate = moment().utc();
			let country = 'DE';
			let isBusiness = true;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({	 
					proRataPeriodPlans: [],
					regularPeriodPlans: newLicences,
					canceledAllPlans: false 
				});
				expect(result.regularPayment.gross).to.equal(200);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(0, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');
				expect(result.proRataPayment).to.not.exists;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});


		it('personal client from UK first time to buy 1 licence', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 1
			}];

			let currentSubscriptions = [];
			
			let paymentDate = moment().utc();
			let country = 'GB';
			let isBusiness = false;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({	 
					proRataPeriodPlans: [],
					regularPeriodPlans: newLicences,
					canceledAllPlans: false 
				});
				expect(result.regularPayment.gross).to.equal(120);
				expect(result.regularPayment.net).to.closeTo(100, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(20, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');
				expect(result.proRataPayment).to.not.exists;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it('personal client from DE first time to buy 2 licences', function(){

			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let currentSubscriptions = [];
			
			let paymentDate = moment().utc();
			let country = 'DE';
			let isBusiness = false;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({	 
					proRataPeriodPlans: [],
					regularPeriodPlans: newLicences,
					canceledAllPlans: false 
				});
				expect(result.regularPayment.gross).to.equal(238);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(38, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');
				expect(result.proRataPayment).to.not.exists;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it('business client from UK having 2 existing licences adds 2 new licences and my anniversary day is 31st Aug and I’m increasing licences on the 30th of Sep 1:30am', function(){
			
			let lastAnniversaryDate = moment('2017-08-31').utc().startOf('date');
			let nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			let paymentDate = moment('2017-09-30').utc();
			let country = 'GB';
			let isBusiness = true;

			//newLicences quantity includes the number of licences user already has in database 
			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 4
			}];

			let currentSubscriptions = [{
				plan: 'THE-100-QUID-PLAN',
				createdAt: new Date(),
				updatedAt: new Date(),
				inCurrentAgreement: true,
				active: true,
				expiredAt: nextPaymentDate
			},{
				plan: 'THE-100-QUID-PLAN',
				createdAt: new Date(),
				updatedAt: new Date(),
				inCurrentAgreement: true,
				active: true,
				expiredAt: nextPaymentDate
			}];

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.regularPeriodPlans).to.deep.equal(newLicences);
				expect(result.changes.proRataPeriodPlans[0].plan).to.equal('THE-100-QUID-PLAN');
				expect(result.changes.proRataPeriodPlans[0].quantity).to.equal(2);
				expect(result.changes.canceledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(480);
				expect(result.regularPayment.net).to.closeTo(400, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(80, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');

				expect(result.proRataPayment.gross).to.closeTo(7.74, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(6.45, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(1.29, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(1);
				expect(result.proRataPayment.length.unit).to.equal('DAY');

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});


		it('business client from UK having 1 existing licence adds 1 licence and my anniversary day is 31st Jan and I’m increasing licences on the 5th of February 2017', function(){
			
			let lastAnniversaryDate = moment('2017-01-31').utc().startOf('date');
			let nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			let paymentDate = moment('2017-02-05').utc();
			let country = 'GB';
			let isBusiness = true;

			//newLicences quantity includes the number of licences user already has in database 
			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let currentSubscriptions = [{
				plan: 'THE-100-QUID-PLAN',
				createdAt: new Date(),
				updatedAt: new Date(),
				inCurrentAgreement: true,
				active: true,
				expiredAt: nextPaymentDate
			}];

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.regularPeriodPlans).to.deep.equal(newLicences);
				expect(result.changes.proRataPeriodPlans[0].plan).to.equal('THE-100-QUID-PLAN');
				expect(result.changes.proRataPeriodPlans[0].quantity).to.equal(1);
				expect(result.changes.canceledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(240);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(40, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');

				expect(result.proRataPayment.gross).to.closeTo(99.31, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(82.76, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(16.55, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(24);
				expect(result.proRataPayment.length.unit).to.equal('DAY');

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it('business client from UK having 1 existing licence adds 1 licence on the anniversary date', function(){

			let lastAnniversaryDate = moment('2017-03-15').utc().startOf('date');
			let nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			let paymentDate = moment('2017-03-15').utc();
			let country = 'GB';
			let isBusiness = true;

			//newLicences quantity includes the number of licences user already has in database 
			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let currentSubscriptions = [{
				plan: 'THE-100-QUID-PLAN',
				createdAt: new Date(),
				updatedAt: new Date(),
				inCurrentAgreement: true,
				active: true,
				expiredAt: nextPaymentDate
			}];

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.regularPeriodPlans).to.deep.equal(newLicences);
				expect(result.changes.proRataPeriodPlans[0].plan).to.equal('THE-100-QUID-PLAN');
				expect(result.changes.proRataPeriodPlans[0].quantity).to.equal(1);
				expect(result.changes.canceledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(240);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(40, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');

				expect(result.proRataPayment.gross).to.closeTo(120, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(100, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(20, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(31);
				expect(result.proRataPayment.length.unit).to.equal('DAY');

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it('business client from DE having 1 existing licence adds 1 licence and my anniversary day is 31st and I’m increasing licences on the 5th of February 2017', function(){
			let lastAnniversaryDate = moment('2017-01-31').utc().startOf('date');
			let nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			let paymentDate = moment('2017-02-05').utc();
			let country = 'DE';
			let isBusiness = true;

			//newLicences quantity includes the number of licences user already has in database 
			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let currentSubscriptions = [{
				plan: 'THE-100-QUID-PLAN',
				createdAt: new Date(),
				updatedAt: new Date(),
				inCurrentAgreement: true,
				active: true,
				expiredAt: nextPaymentDate
			}];

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.regularPeriodPlans).to.deep.equal(newLicences);
				expect(result.changes.proRataPeriodPlans[0].plan).to.equal('THE-100-QUID-PLAN');
				expect(result.changes.proRataPeriodPlans[0].quantity).to.equal(1);
				expect(result.changes.canceledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(200);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(0, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');

				expect(result.proRataPayment.gross).to.closeTo(82.76, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(82.76, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(0, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(24);
				expect(result.proRataPayment.length.unit).to.equal('DAY');

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it('business client from UK remove 1 licence from 3 licences', function(){

			let lastAnniversaryDate = moment('2017-03-15').utc().startOf('date');
			let nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			let paymentDate = moment('2017-03-28').utc();
			let country = 'GB';
			let isBusiness = true;

			//newLicences quantity includes the number of licences user already has in database 
			let newLicences = [{
				plan: 'THE-100-QUID-PLAN',
				quantity: 2
			}];

			let currentSubscriptions = [];

			for(let i=0; i<3; i++){
				currentSubscriptions.push({
					plan: 'THE-100-QUID-PLAN',
					createdAt: new Date(),
					updatedAt: new Date(),
					inCurrentAgreement: true,
					active: true,
					expiredAt: nextPaymentDate
				});
			}

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {
				
				expect(result.changes).to.deep.equal({	 
					proRataPeriodPlans: [],
					regularPeriodPlans: newLicences,
					canceledAllPlans: false 
				});

				expect(result.regularPayment.gross).to.equal(240);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(40, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal('MONTH');

				expect(result.proRataPayment).to.not.exists;

				expect(result.paymentDate.toISOString()).to.equal(nextPaymentDate.toISOString());
			});

		});

	});
});
