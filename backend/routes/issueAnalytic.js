/**
 *	Copyright (C) 2017 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.ap
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
(() => {
	const express = require("express");
	const router = express.Router({ mergeParams: true });
	const middlewares = require("../middlewares/middlewares");
	const responseCodes = require("../response_codes.js");
	const IssueAnalytic = require("../models/issueAnalytic");
	const utils = require("../utils");

	/**
	 * @api {get} /:teamspace/:model/issues/analytics.:format Get Issue Analytics
	 * @apiName getIssueAnalytics
	 * @apiGroup Issues Analytics
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam analytics.:format Analytics file to create
	 */

	router.get("/issues/analytics.:format", middlewares.issue.canView, getIssueAnalytics);

	function getIssueAnalytics(req, res, next) {
		const place = utils.APIInfo(req);
		const sort = parseInt(req.query.sort) || -1;
		const groups = req.query.groupBy.split(",");

		IssueAnalytic.groupBy(req.params.account, req.params.model, groups, sort, req.params.format)
			.then(docs => {
				if (req.params.format === "csv") {
					res.set("Content-Disposition", "attachment;filename=data.csv");
					res.send(docs);
				} else {
					responseCodes.respond(place, req, res, next, responseCodes.OK, docs);
				}
			})
			.catch(err => {
				responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
			});
	}

	module.exports = router;
})();
