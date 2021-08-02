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
const app = require("../../../src/v4/services/api.js").createApp();
const responseCodes = require("../../../src/v4/response_codes");


const invoicesData = [
	{
			"_id": "600ad1965912e2437c029b82",
			"invoiceNo": "SO-2",
			"nextPaymentAmount": 360,
			"taxAmount": 60,
			"amount": 360,
			"currency": "GBP",
			"transactionId": "99999999AA000000A",
			"gateway": "PAYPAL",
			"billingAgreementId": "I-000000000000",
			"periodEnd": "2021-03-21",
			"periodStart": "2021-02-22",
			"info": {
					"vat": "206909015",
					"countryCode": "GB",
					"postalCode": "A00 2ss020",
					"city": "London",
					"company": "3D Repo",
					"lastName": "liu",
					"firstName": "henry",
					"line3": "line3",
					"line2": "line2",
					"line1": "line1",
					"_id": "600ad18f5912e2437c029a5b",
					"countryName": "United Kingdom"
			},
			"nextPaymentDate": "2021-03-22",
			"createdAt": "22-01-2021 13:22",
			"state": "complete",
			"items": [
					{
							"name": "hundredQuidPlan",
							"currency": "GBP",
							"amount": 120,
							"taxAmount": 20,
							"_id": "600ad18f5912e2437c029aad",
							"description": "100-QUID-PRO-PLAN",
							"id": "600ad18f5912e2437c029aad"
					},
					{
							"name": "hundredQuidPlan",
							"currency": "GBP",
							"amount": 120,
							"taxAmount": 20,
							"_id": "600ad18f5912e2437c029aae",
							"description": "100-QUID-PRO-PLAN",
							"id": "600ad18f5912e2437c029aae"
					},
					{
							"name": "hundredQuidPlan",
							"currency": "GBP",
							"amount": 120,
							"taxAmount": 20,
							"_id": "600ad18f5912e2437c029aaf",
							"description": "100-QUID-PRO-PLAN",
							"id": "600ad18f5912e2437c029aaf"
					}
			],
			"type": "invoice",
			"__v": 0,
			"netAmount": 300,
			"createdAtDate": "2021-01-22",
			"B2B_EU": true,
			"taxPercentage": 20,
			"unitPrice": "100.00",
			"pending": false,
			"proRata": true,
			"id": "600ad1965912e2437c029b82"
	},
	{
			"_id": "600ad1935912e2437c029b60",
			"invoiceNo": "CN-1",
			"transactionId": "4G401246NU073361P",
			"billingAgreementId": "I-000000000000",
			"taxAmount": 20,
			"amount": 120,
			"currency": "GBP",
			"createdAt": "22-01-2021 13:22",
			"gateway": "PAYPAL",
			"info": {
					"vat": "206909015",
					"countryCode": "GB",
					"postalCode": "A00 2ss020",
					"city": "London",
					"company": "3D Repo",
					"lastName": "liu",
					"firstName": "henry",
					"line3": "line3",
					"line2": "line2",
					"line1": "line1",
					"_id": "600ad18f5912e2437c029a5b",
					"countryName": "United Kingdom"
			},
			"state": "complete",
			"items": [],
			"type": "refund",
			"__v": 0,
			"nextPaymentAmount": null,
			"netAmount": 100,
			"createdAtDate": "2021-01-22",
			"B2B_EU": true,
			"taxPercentage": 20,
			"unitPrice": "Infinity",
			"pending": false,
			"proRata": true,
			"id": "600ad1935912e2437c029b60",
			"periodStart": null,
			"periodEnd": null,
			"nextPaymentDate": null
	},
	{
			"_id": "600ad18f5912e2437c029aac",
			"periodEnd": "2021-02-21",
			"periodStart": "2021-01-22",
			"nextPaymentAmount": 360,
			"taxAmount": 60,
			"amount": 360,
			"currency": "GBP",
			"paypalPaymentToken": "EC-2AX25360HG2794932",
			"info": {
					"vat": "206909015",
					"countryCode": "GB",
					"postalCode": "A00 2ss020",
					"city": "London",
					"company": "3D Repo",
					"lastName": "liu",
					"firstName": "henry",
					"line3": "line3",
					"line2": "line2",
					"line1": "line1",
					"_id": "600ad18f5912e2437c029a5b",
					"countryName": "United Kingdom"
			},
			"nextPaymentDate": "2021-02-22",
			"createdAt": "22-01-2021 13:22",
			"state": "complete",
			"items": [
					{
							"name": "hundredQuidPlan",
							"currency": "GBP",
							"amount": 120,
							"taxAmount": 20,
							"_id": "600ad18f5912e2437c029aad",
							"description": "100-QUID-PRO-PLAN",
							"id": "600ad18f5912e2437c029aad"
					},
					{
							"name": "hundredQuidPlan",
							"currency": "GBP",
							"amount": 120,
							"taxAmount": 20,
							"_id": "600ad18f5912e2437c029aae",
							"description": "100-QUID-PRO-PLAN",
							"id": "600ad18f5912e2437c029aae"
					},
					{
							"name": "hundredQuidPlan",
							"currency": "GBP",
							"amount": 120,
							"taxAmount": 20,
							"_id": "600ad18f5912e2437c029aaf",
							"description": "100-QUID-PRO-PLAN",
							"id": "600ad18f5912e2437c029aaf"
					}
			],
			"type": "invoice",
			"__v": 0,
			"billingAgreementId": "I-000000000000",
			"gateway": "PAYPAL",
			"invoiceNo": "SO-1",
			"transactionId": "7VE78102JM363223J",
			"netAmount": 300,
			"createdAtDate": "2021-01-22",
			"B2B_EU": true,
			"taxPercentage": 20,
			"unitPrice": "100.00",
			"pending": false,
			"proRata": true,
			"id": "600ad18f5912e2437c029aac"
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
