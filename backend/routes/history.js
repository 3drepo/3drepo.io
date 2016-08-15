/**
 *  Copyright (C) 2016 3D Repo Ltd
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

var express = require('express');
var router = express.Router({mergeParams: true});
var middlewares = require('./middlewares');

var C = require("../constants");
var responseCodes = require('../response_codes.js');
var History = require('../models/history');
var utils = require('../utils');

router.get('/revisions.json', middlewares.hasReadAccessToProject, listRevisions);
router.get('/revisions/:branch.json', middlewares.hasReadAccessToProject, listRevisionsByBranch);

function listRevisions(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;


	History.find({account, project}, {}, {_id : 1, timestamp: 1}, {sort: {timestamp: -1}}).then(histories => {
		
		histories = History.clean(histories);
		responseCodes.respond(place, req, res, next, responseCodes.OK, histories);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}

function listRevisionsByBranch(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;


	History.listByBranch({account, project}, req.params.branch, {_id : 1, timestamp: 1}).then(histories => {
		
		histories = History.clean(histories);
		responseCodes.respond(place, req, res, next, responseCodes.OK, histories);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}

module.exports = router;
