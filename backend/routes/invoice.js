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

"use strict";
(() => {
	const middlewares = require("../middlewares/middlewares");
	const express = require("express");
	const router = express.Router({ mergeParams: true });

	const responseCodes = require("../response_codes.js");
	const config = require("../config");
	const utils = require("../utils");
	const Invoice = require("../models/invoice");
	const moment = require("moment");

	/**
   * @api {get} /invoices List all invoices
   * @apiName listInvoices
   * @apiGroup Invoice
   *
   * @apiDescription List all invoices if available, to current logged in user.
   * @apiSuccess (200) {Object} Invoice Object
   * @apiSuccessExample {json} Success-Response
   * HTTP/1.1 200 OK
   * [
   *  {
   *    "_id":"invoice_ID",
   *    "invoiceNo":"AA-111",
   *    "nextPaymentAmount":00,
   *    "taxAmount":0,
   *    "amount":00,
   *    "currency":"GBP",
   *    "transactionId":"transaction_ID",
   *    "gateway":"GATEWAY_PROVIDER",
   *    "billingAgreementId":"billing_agreement_ID",
   *    "periodEnd":"2018-06-03",
   *    "periodStart":"2018-05-04",
   *      "info":
   *        {
   *          "vat":"",
   *          "countryCode":"AO",
   *          "postalCode":"SW11 1BQ",
   *          "city":"London",
   *          "line2":"1 Street Road",
   *          "line1":"London",
   *          "company":"Comapny",
   *          "lastName":"User Lastname",
   *          "firstName":"User Firstname",
   *          "_id":"invoice_ID",
   *          "countryName":"United Kingdom"
   *        },
   *     "nextPaymentDate":"2018-06-04",
   *     "createdAt":"04-05-2018 15:59",
   *     "__v":0,"state":"complete",
   *     "items":
   *        [{
   *           "name":"pricingPlanName",
   *            "currency":"GBP",
   *            "amount":00,
   *            "taxAmount":0,
   *            "_id":"invoice_ID",
   *            "description":"Advance License (from 2018)",
   *            "id":"invoice_ID"},
   *              {
   *                "name":"pricingPlanName",
   *                "currency":"GBP",
   *                "amount":29,
   *                "taxAmount":0,
   *                "_id":"invoice_ID",
   *                "description":"This is a dummy invoice for use with API Documentation",
   *                "id":"invoice_ID"
   *        }],
   *                "type":"invoice",
   *                "proRata":false,
   *                "pending":false,
   *                "unitPrice":"29.00",
   *                "B2B_EU":false,
   *                "taxPercentage":0,
   *                "createdAtDate":"2018-05-04",
   *                "netAmount":00
   *  }
   * ]
   *
   * @apiError (401) NOT_AUTHORIZED Not Authorized
   * @apiErrorExample {json} Error-Response
   *
   * HTTP/1.1 401 Not Authorized
   * {
   * 	"message":"Not Authorized",
   * 	"status":401,"code":
   * 	"NOT_AUTHORIZED",
   * 	"value":9,
   * 	"place":"GET /nabile/subscriptions"
   * }
   */
	router.get("/invoices", middlewares.isAccountAdmin, listInvoices);

	/**
   * @api {get} /invoices/:invoiceNo.html Render invoices as HTML
   * @apiName renderInvoice
   * @apiGroup Invoice
   * @apiParam {String} invoiceNo Invoice number to render.
   *
   * @apiDescription Render a HTML web page of the requested invoice.
   *
   */
	router.get("/invoices/:invoiceNo.html", middlewares.isAccountAdmin, renderInvoice);

	/**
   * @api {get} /invoices/:invoiceNo.pdf Render invoices as PDF
   * @apiName renderInvoicePDF
   * @apiGroup Invoice
   *
   * @apiParam invoiceNo.pdf Invoice to render.
   *
   * @apiDescription Render out a PDF version of the requested invocie.
   */
	router.get("/invoices/:invoiceNo.pdf", middlewares.isAccountAdmin, renderInvoicePDF);

	function listInvoices(req, res, next) {
		const responsePlace = utils.APIInfo(req);
		Invoice.findByAccount(req.params.account)
			.then(invoices => {
				responseCodes.respond(
					responsePlace,
					req,
					res,
					next,
					responseCodes.OK,
					invoices
				);
			})
			.catch(err => {
				responseCodes.respond(
					responsePlace,
					req,
					res,
					next,
					err.resCode || utils.mongoErrorToResCode(err),
					err.resCode ? {} : err
				);
			});
	}

	function renderInvoice(req, res, next) {
		const responsePlace = utils.APIInfo(req);
		Invoice.findByInvoiceNo(req.params.account, req.params.invoiceNo).then(invoice => {

			if(!invoice) {
				return Promise.reject(responseCodes.BILLING_NOT_FOUND);
			}

			let template = "invoice.pug";

			if(invoice.type === "refund") {
				template = "refund.pug";
			}

			res.render(template, {billing : invoice.toJSON(), baseURL: config.getBaseURL()});

		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function renderInvoicePDF(req, res) {
		let invoice;

		Invoice.findByInvoiceNo(req.params.account, req.params.invoiceNo).then(_invoice => {

			invoice = _invoice;
			if(!invoice) {
				return Promise.reject(responseCodes.BILLING_NOT_FOUND);
			}
			return invoice.generatePDF(req.params.account);

		}).then(pdf => {

			res.writeHead(200, {
				"Content-Type": "application/pdf",
				"Content-disposition": `inline; filename="${moment(invoice.createdAtDate).utc().format("YYYY-MM-DD")}_${invoice.type}-${invoice.invoiceNo}.pdf"`,
				"Content-Length": pdf.length
			});
		});
	}

	module.exports = router;
})();
