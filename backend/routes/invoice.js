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

(() => {
	"use strict";

	const middlewares = require("./middlewares");
	const express = require("express");
	const router = express.Router({ mergeParams: true });
	const User = require("../models/user");
	const responseCodes = require("../response_codes.js");
	const config = require("../config");
	const utils = require("../utils");
	const Invoice = require("../models/invoice");
	const moment = require('moment');

	router.get("/invoices", middlewares.isAccountAdmin, listInvoices);
	router.get("/invoices/:invoiceNo.html", middlewares.isAccountAdmin, renderInvoice);
	router.get("/invoices/:invoiceNo.pdf", middlewares.isAccountAdmin, renderInvoicePDF);


	function listInvoices(req, res, next){

		let responsePlace = utils.APIInfo(req);
		Invoice.findByAccount(req.params.account).then(invoices => {

			responseCodes.respond(responsePlace, req, res, next, responseCodes.OK, invoices);
		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function renderInvoice(req, res, next){

		let responsePlace = utils.APIInfo(req);
		Invoice.findByInvoiceNo(req.params.account, req.params.invoiceNo).then(invoice => {

			if(!invoice){
				return Promise.reject(responseCodes.BILLING_NOT_FOUND);
			}

			let template = "invoice.jade";

			if(invoice.type === "refund"){
				template = "refund.jade";
			}

			console.log( invoice.toJSON());
			
			res.render(template, {billing : invoice.toJSON(), baseURL: config.getBaseURL()});

		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}

	function renderInvoicePDF(req, res, next){

		let responsePlace = utils.APIInfo(req);
		let invoice;
		let regenerate;

		if(config.pdf && config.pdf.debug && config.pdf.debug.allowRegenerate){
			regenerate = req.query.regenerate;
		}

		Invoice.findByInvoiceNo(req.params.account, req.params.invoiceNo).then(_invoice => {

			invoice = _invoice;
			if(!invoice){
				return Promise.reject(responseCodes.BILLING_NOT_FOUND);
			}

			return invoice.getPDF({regenerate: regenerate});

		}).then(pdf => {


			res.writeHead(200, {
				'Content-Type': 'application/pdf',
				'Content-disposition': `inline; filename="${moment(invoice.createdAt).utc().format('YYYY-MM-DD')}_${invoice.type}-${invoice.invoiceNo}.pdf"`,
				'Content-Length': pdf.length
			});

			res.end(pdf);

		}).catch(err => {
			responseCodes.respond(responsePlace, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	}


	module.exports = router;

})();
