/**
 *  Copyright (C) 2017 3D Repo Ltd
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

(function() {
	"use strict";

	const express = require('express');
	const router = express.Router({mergeParams: true});
	const responseCodes = require('../response_codes');
	const ModelHelpers = require('../models/helper/model');
	const middlewares = require('./middlewares');
	const utils = require('../utils');

	//Get meta data
	router.get('/meta/:id.json', middlewares.hasReadAccessToModel, getMetadata);


	function getMetadata(req, res, next){

		ModelHelpers.getMetadata(req.params.account, req.params.model, req.params.id).then(meta => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, {meta: [meta]});
		}).catch(err => {

			responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
		});
		
	}

	module.exports = router;
}());
