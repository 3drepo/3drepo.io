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
var C = require('../constants');

var responseCodes = require('../response_codes.js');
var History = require('../models/history');
var utils = require('../utils');

router.get('/revisions.json', middlewares.hasReadAccessToModel, listRevisions);
router.get('/revisions/:branch.json', middlewares.hasReadAccessToModel, listRevisionsByBranch);
router.put('/revisions/:id/tag', middlewares.hasReadAccessToModel, updateRevisionTag);

function listRevisions(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;


	History.find({account, project}, {}, {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1}, {sort: {timestamp: -1}}).then(histories => {
		
		histories = History.clean(histories);

		histories.forEach(function(history) {
			history.branch = history.branch || C.MASTER_BRANCH_NAME;
		});

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


	History.listByBranch({account, project}, req.params.branch, {_id : 1, tag: 1, timestamp: 1, desc: 1, author: 1}).then(histories => {
		
		histories = History.clean(histories);

		histories.forEach(function(history) {
			history.branch = history.branch || req.params.branch;
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, histories);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode ? err.resCode: err, err.resCode ? err.resCode: err);
	});
}

function updateRevisionTag(req, res, next){
	'use strict';

	let place = utils.APIInfo(req);
	let account = req.params.account;
	let project = req.params.project;

	History.findByUID({account, project}, req.params.id, {_id : 1, tag: 1}).then(history => {
		if (!history){
			return Promise.reject(responseCodes.PROJECT_HISTORY_NOT_FOUND);
		} else {
			history.tag = req.body.tag;
			return history.save();
		}
	}).then(history => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, history.clean());
	}).catch(err => {
		responseCodes.respond(place, req, res, next, err, err);
	});
}

module.exports = router;
