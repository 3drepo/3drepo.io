"use strict";

const expect = require("chai").expect;
const moment = require("moment");
const proxyquire = require("proxyquire").noCallThru();

const UserBilling = proxyquire("../../../../src/v4/models/userBilling", {
	"./subscriptions": {},
	"./billingAddress": {},
	"./paypal.js": {},
	"./invoice.js": {},
	"../response_codes.js": {},
	"./counter": {},
	"./role": {},
	"../mailer/mailer": {},
	"./user": {}
});

const C = require("../../../../src/v4/constants");

describe("UserBilling", function() {
/*
	describe(".getNextPaymentDate", function() {

		it("should = 2016-02-01 if payment date is 2016-01-01", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-01-01")).toISOString()).to.equal("2016-02-01T00:00:00.000Z");
		});

		it("should = 2016-03-01 if payment date is 2016-01-30", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-01-30")).toISOString()).to.equal("2016-03-01T00:00:00.000Z");
		});

		it("should = 2016-03-01 if payment date is 2016-01-31", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-01-31")).toISOString()).to.equal("2016-03-01T00:00:00.000Z");
		});

		it("should = 2016-02-29 if payment date is 2016-01-29", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-01-29")).toISOString()).to.equal("2016-02-29T00:00:00.000Z");
		});

		it("should = 2016-02-28 if payment date is 2016-02-28", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-01-28")).toISOString()).to.equal("2016-02-28T00:00:00.000Z");
		});

		it("should = 2015-03-01 if payment date is 2015-01-29", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2015-01-29")).toISOString()).to.equal("2015-03-01T00:00:00.000Z");
		});

		it("should = 2015-02-28 if payment date is 2015-01-28", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2015-01-28")).toISOString()).to.equal("2015-02-28T00:00:00.000Z");
		});

		it("should = 2016-05-01 if payment date is 2016-03-31", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-03-31")).toISOString()).to.equal("2016-05-01T00:00:00.000Z");
		});

		it("should = 2016-08-31 if payment date is 2016-07-31", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-07-31")).toISOString()).to.equal("2016-08-31T00:00:00.000Z");
		});

		it("should = 2016-09-30 if payment date is 2016-08-30", function() {
			expect(UserBilling.statics.getNextPaymentDate(new Date("2016-08-30")).toISOString()).to.equal("2016-09-30T00:00:00.000Z");
		});

	});

	function createPaymentTest(data) {

		const instanceProp = {
			subscriptions : data.currentSubscriptions,
			billingInfo: {
				countryCode: data.country,
				vat: data.isBusiness ? "ABC123" : null
			}
		};

		if(data.currentSubscriptions.paypal && data.currentSubscriptions.paypal.length > 0) {
			// Add a billing agreement Id into the instance if we have paypal subscriptions
			instanceProp.billingAgreementId = "I-5WJWJKFH40KD";
		}
		if(data.lastAnniversaryDate) {
			instanceProp.lastAnniversaryDate = data.lastAnniversaryDate.toDate();
			instanceProp.nextPaymentDate =  data.nextPaymentDate;
		}

		return UserBilling.methods.writeSubscriptionChanges.call(instanceProp, data.newLicences).then(changes => {

			const paymentData = UserBilling.methods.calculateAmounts.call(instanceProp, data.paymentDate, changes);

			const proRataPayment = paymentData.payments.find(payment => payment.type === C.PRO_RATA_PAYMENT);
			const regularPayment = paymentData.payments.find(payment => payment.type === C.REGULAR_PAYMENT);

			return {changes, proRataPayment, regularPayment, paymentDate: paymentData.paymentDate};
		});

	}

	describe("send correct payment info to paypal given old and new licences information", function() {

		it("business client from UK first time to buy 1 licence", function() {

			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 1
			}];

			const currentSubscriptions = {};

			const paymentDate = moment().utc();
			const country = "GB";
			const isBusiness = true;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({
					cancelledAllPlans: false
				});
				expect(result.regularPayment.gross).to.equal(120);
				expect(result.regularPayment.net).to.closeTo(100, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(20, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");
				expect(result.proRataPayment).to.not.exist;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from UK first time to buy 3 licence", function() {

			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 3
			}];

			const currentSubscriptions = {};

			const paymentDate = moment().utc();
			const country = "GB";
			const isBusiness = true;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {
				expect(result.changes).to.deep.equal({
					cancelledAllPlans: false
				});
				expect(result.regularPayment.gross).to.equal(360);
				expect(result.regularPayment.net).to.closeTo(300, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(60, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");
				expect(result.proRataPayment).to.not.exist;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from DE first time to buy 2 licence", function() {

			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 2
			}];

			const currentSubscriptions = {};

			const paymentDate = moment().utc();
			const country = "DE";
			const isBusiness = true;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({
					cancelledAllPlans: false
				});
				expect(result.regularPayment.gross).to.equal(200);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(0, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");
				expect(result.proRataPayment).to.not.exist;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("personal client from UK first time to buy 1 licence", function() {

			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 1
			}];

			const currentSubscriptions = {};

			const paymentDate = moment().utc();
			const country = "GB";
			const isBusiness = false;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({
					cancelledAllPlans: false
				});
				expect(result.regularPayment.gross).to.equal(120);
				expect(result.regularPayment.net).to.closeTo(100, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(20, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");
				expect(result.proRataPayment).to.not.exist;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("personal client from DE first time to buy 2 licences", function() {

			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 2
			}];

			const currentSubscriptions = {};

			const paymentDate = moment().utc();
			const country = "DE";
			const isBusiness = false;

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness }).then(result => {

				expect(result.changes).to.deep.equal({
					cancelledAllPlans: false
				});
				expect(result.regularPayment.gross).to.equal(238);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(38, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");
				expect(result.proRataPayment).to.not.exist;
				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from UK having 2 existing licences adds 2 new licences and my anniversary day is 31st Aug and I’m increasing licences on the 30th of Sep 1:30am", function() {

			const lastAnniversaryDate = moment("2017-08-31").utc().startOf("date");
			const nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			const paymentDate = moment("2017-09-30").utc();
			const country = "GB";
			const isBusiness = true;

			// newLicences quantity includes the number of licences user already has in database
			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 4
			}];

			const currentSubscriptions = {
				paypal:
				[{
					plan: "hundredQuidPlan",
					quantity: 2,
					expiryDate: nextPaymentDate
				}]
			};

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.cancelledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(480);
				expect(result.regularPayment.net).to.closeTo(400, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(80, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");

				expect(result.proRataPayment.gross).to.closeTo(7.74, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(6.45, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(1.29, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(1);
				expect(result.proRataPayment.length.unit).to.equal("DAY");

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from UK having 1 existing licence adds 1 licence and my anniversary day is 31st Jan and I’m increasing licences on the 5th of February 2017", function() {

			const lastAnniversaryDate = moment("2017-01-31").utc().startOf("date");
			const nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			const paymentDate = moment("2017-02-05").utc();
			const country = "GB";
			const isBusiness = true;

			// newLicences quantity includes the number of licences user already has in database
			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 2
			}];

			const currentSubscriptions = {
				paypal: [{
					plan: "hundredQuidPlan",
					quantity: 1,
					expiryDate: nextPaymentDate }
				]};

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.cancelledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(240);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(40, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");

				expect(result.proRataPayment.gross).to.closeTo(99.31, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(82.76, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(16.55, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(24);
				expect(result.proRataPayment.length.unit).to.equal("DAY");

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from UK having 1 existing licence adds 1 licence on the anniversary date", function() {

			const lastAnniversaryDate = moment("2017-03-15").utc().startOf("date");
			const nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			const paymentDate = moment("2017-03-15").utc();
			const country = "GB";
			const isBusiness = true;

			// newLicences quantity includes the number of licences user already has in database
			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 2
			}];

			const currentSubscriptions = {
				paypal: [{
					plan: "hundredQuidPlan",
					quantity: 1,
					expiryDate: nextPaymentDate}
				]};

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.cancelledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(240);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(40, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");

				expect(result.proRataPayment.gross).to.closeTo(120, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(100, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(20, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(31);
				expect(result.proRataPayment.length.unit).to.equal("DAY");

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from DE having 1 existing licence adds 1 licence and my anniversary day is 31st and I’m increasing licences on the 5th of February 2017", function() {
			const lastAnniversaryDate = moment("2017-01-31").utc().startOf("date");
			const nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			const paymentDate = moment("2017-02-05").utc();
			const country = "DE";
			const isBusiness = true;

			// newLicences quantity includes the number of licences user already has in database
			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 2
			}];

			const currentSubscriptions = {
				paypal: [{
					plan: "hundredQuidPlan",
					quantity: 1,
					expiryDate: nextPaymentDate}
				]};

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes.cancelledAllPlans).to.be.false;

				expect(result.regularPayment.gross).to.equal(200);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(0, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");

				expect(result.proRataPayment.gross).to.closeTo(82.76, Number.EPSILON);
				expect(result.proRataPayment.net).to.closeTo(82.76, Number.EPSILON);
				expect(result.proRataPayment.tax).to.closeTo(0, Number.EPSILON);
				expect(result.proRataPayment.length.value).to.equal(24);
				expect(result.proRataPayment.length.unit).to.equal("DAY");

				expect(result.paymentDate.toISOString()).to.equal(paymentDate.toISOString());
			});
		});

		it("business client from UK remove 1 licence from 3 licences", function() {

			const lastAnniversaryDate = moment("2017-03-15").utc().startOf("date");
			const nextPaymentDate = UserBilling.statics.getNextPaymentDate(lastAnniversaryDate.toDate());
			const paymentDate = moment("2017-03-28").utc();
			const country = "GB";
			const isBusiness = true;

			// newLicences quantity includes the number of licences user already has in database
			const newLicences = [{
				plan: "hundredQuidPlan",
				quantity: 2
			}];

			const currentSubscriptions = {
				paypal: [{
					plan: "hundredQuidPlan",
					quantity: 3,
					expiryDate: nextPaymentDate
				}]};

			return createPaymentTest({currentSubscriptions, newLicences, paymentDate, country, isBusiness, lastAnniversaryDate, nextPaymentDate }).then(result => {

				expect(result.changes).to.deep.equal({
					cancelledAllPlans: false
				});

				expect(result.regularPayment.gross).to.equal(240);
				expect(result.regularPayment.net).to.closeTo(200, Number.EPSILON);
				expect(result.regularPayment.tax).to.closeTo(40, Number.EPSILON);
				expect(result.regularPayment.length.value).to.equal(1);
				expect(result.regularPayment.length.unit).to.equal("MONTH");

				expect(result.proRataPayment).to.not.exist;

				expect(result.paymentDate.toISOString()).to.equal(nextPaymentDate.toISOString());
			});

		});

	});

	Paypal commented out
	*/
});
