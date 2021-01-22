/**
 *  Copyright (C) 2019 3D Repo Ltd
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

"use strict";

const request = require("supertest");
const expect = require("chai").expect;
const app = require("../../services/api.js").createApp();
const responseCodes = require("../../response_codes");


const invoicesData = [
	{
	  "_id": "6009a7e1fa97264948473fcf",
	  "invoiceNo": "SO-2",
	  "nextPaymentAmount": 360,
	  "taxAmount": 60,
	  "amount": 360,
	  "currency": "GBP",
	  "transactionId": "99999999AA000000A",
	  "gateway": "PAYPAL",
	  "billingAgreementId": "I-000000000000",
	  "periodEnd": "2021-03-20",
	  "periodStart": "2021-02-21",
	  "info": {
		"_id": "6009a7dafa97264948473eae",
		"line1": "line1",
		"line2": "line2",
		"line3": "line3",
		"firstName": "henry",
		"lastName": "liu",
		"company": "3D Repo",
		"city": "London",
		"postalCode": "A00 2ss020",
		"countryCode": "GB",
		"vat": "206909015",
		"countryName": "United Kingdom"
	  },
	  "nextPaymentDate": "2021-03-21",
	  "createdAt": "21-01-2021 16:12",
	  "__v": 0,
	  "state": "complete",
	  "items": [
		{
		  "name": "hundredQuidPlan",
		  "currency": "GBP",
		  "amount": 120,
		  "taxAmount": 20,
		  "_id": "6009a7dafa97264948473f00",
		  "description": "100-QUID-PRO-PLAN",
		  "id": "6009a7dafa97264948473f00"
		},
		{
		  "name": "hundredQuidPlan",
		  "currency": "GBP",
		  "amount": 120,
		  "taxAmount": 20,
		  "_id": "6009a7dafa97264948473f01",
		  "description": "100-QUID-PRO-PLAN",
		  "id": "6009a7dafa97264948473f01"
		},
		{
		  "name": "hundredQuidPlan",
		  "currency": "GBP",
		  "amount": 120,
		  "taxAmount": 20,
		  "_id": "6009a7dafa97264948473f02",
		  "description": "100-QUID-PRO-PLAN",
		  "id": "6009a7dafa97264948473f02"
		}
	  ],
	  "type": "invoice",
	  "proRata": true,
	  "pending": false,
	  "unitPrice": "100.00",
	  "B2B_EU": true,
	  "taxPercentage": 20,
	  "createdAtDate": "2021-01-21",
	  "netAmount": 300,
	  "id": "6009a7e1fa97264948473fcf"
	},
	{
	  "_id": "6009a7defa97264948473fb4",
	  "invoiceNo": "CN-1",
	  "transactionId": "4G401246NU073361P",
	  "billingAgreementId": "I-000000000000",
	  "taxAmount": 20,
	  "amount": 120,
	  "currency": "GBP",
	  "createdAt": "21-01-2021 16:12",
	  "gateway": "PAYPAL",
	  "info": {
		"_id": "6009a7dafa97264948473eae",
		"line1": "line1",
		"line2": "line2",
		"line3": "line3",
		"firstName": "henry",
		"lastName": "liu",
		"company": "3D Repo",
		"city": "London",
		"postalCode": "A00 2ss020",
		"countryCode": "GB",
		"vat": "206909015",
		"countryName": "United Kingdom"
	  },
	  "__v": 0,
	  "state": "complete",
	  "items": [
	  ],
	  "type": "refund",
	  "nextPaymentAmount": null,
	  "nextPaymentDate": "2021-01-21",
	  "periodEnd": "2021-01-21",
	  "periodStart": "2021-01-21",
	  "proRata": true,
	  "pending": false,
	  "unitPrice": "Infinity",
	  "B2B_EU": true,
	  "taxPercentage": 20,
	  "createdAtDate": "2021-01-21",
	  "netAmount": 100,
	  "id": "6009a7defa97264948473fb4"
	},
	{
	  "_id": "6009a7dafa97264948473eff",
	  "periodEnd": "2021-02-20",
	  "periodStart": "2021-01-21",
	  "nextPaymentAmount": 360,
	  "taxAmount": 60,
	  "amount": 360,
	  "currency": "GBP",
	  "paypalPaymentToken": "EC-2AX25360HG2794932",
	  "info": {
		"_id": "6009a7dafa97264948473eae",
		"line1": "line1",
		"line2": "line2",
		"line3": "line3",
		"firstName": "henry",
		"lastName": "liu",
		"company": "3D Repo",
		"city": "London",
		"postalCode": "A00 2ss020",
		"countryCode": "GB",
		"vat": "206909015",
		"countryName": "United Kingdom"
	  },
	  "nextPaymentDate": "2021-02-21",
	  "createdAt": "21-01-2021 16:12",
	  "__v": 0,
	  "billingAgreementId": "I-000000000000",
	  "gateway": "PAYPAL",
	  "invoiceNo": "SO-1",
	  "transactionId": "7VE78102JM363223J",
	  "state": "complete",
	  "items": [
		{
		  "name": "hundredQuidPlan",
		  "currency": "GBP",
		  "amount": 120,
		  "taxAmount": 20,
		  "_id": "6009a7dafa97264948473f00",
		  "description": "100-QUID-PRO-PLAN",
		  "id": "6009a7dafa97264948473f00"
		},
		{
		  "name": "hundredQuidPlan",
		  "currency": "GBP",
		  "amount": 120,
		  "taxAmount": 20,
		  "_id": "6009a7dafa97264948473f01",
		  "description": "100-QUID-PRO-PLAN",
		  "id": "6009a7dafa97264948473f01"
		},
		{
		  "name": "hundredQuidPlan",
		  "currency": "GBP",
		  "amount": 120,
		  "taxAmount": 20,
		  "_id": "6009a7dafa97264948473f02",
		  "description": "100-QUID-PRO-PLAN",
		  "id": "6009a7dafa97264948473f02"
		}
	  ],
	  "type": "invoice",
	  "proRata": true,
	  "pending": false,
	  "unitPrice": "100.00",
	  "B2B_EU": true,
	  "taxPercentage": 20,
	  "createdAtDate": "2021-01-21",
	  "netAmount": 300,
	  "id": "6009a7dafa97264948473eff"
	}
  ];



describe("Invoice", function() {
	let server;
	let agent;
	const timeout = 30000;
	const username = "invoiceTest";
	const password = "password";


	before(function(done) {

		server = app.listen(8080, function () {
			agent = request.agent(server);
			console.log("API test server is listening on port 8080!");


			agent.post("/login")
				.send({username, password})
				.expect(200, done);
		});
	});

	after(function(done) {

		server.close(function() {
			console.log("API test server is closed");
			done();
		});

	});

	it("user should be able to fetch them", async function() {
		const {body} = await agent.get(`/${username}/invoices`).expect(200);
		expect(body).to.deep.equal(invoicesData);
	});

});