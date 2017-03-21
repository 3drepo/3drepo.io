/**
 *  Copyright (C) 2017 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as
 *  published by the Free Software Foundation, either version 3 of the
 *  License, or (at your option) any later version.ap
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

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const middlewares = require('./middlewares');
	const responseCodes = require('../response_codes.js');
	const IssueAnalytic = require('../models/issueAnalytic');
	const utils = require("../utils");

	router.get('/issues/analytics', middlewares.hasReadAccessToIssue, getIssueAnalytics);

	function getIssueAnalytics(req, res, next){
		
		const place = utils.APIInfo(req);
		const sort = parseInt(req.query.sort) || -1;
		
		IssueAnalytic.groupBy(req.params.account, req.params.project, req.query.groupBy, req.query.secGroupBy, sort).then(docs => {

			responseCodes.respond(place, req, res, next, responseCodes.OK, docs);
		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});

	}

	module.exports = router;

})();