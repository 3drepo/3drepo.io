/**
 * Copyright (C) 2018 3D Repo Ltd
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";
(function() {
	const express = require("express");
	const router = express.Router({ mergeParams: true });
	const responseCodes = require("../response_codes");
	const ModelHelpers = require("../models/helper/model");
	const Meta = require("../models/meta");
	const middlewares = require("../middlewares/middlewares");
	const utils = require("../utils");
	const C = require("../constants");

	// Get meta data

	/**
	 * @api {get} /:teamspace/:model/revision/master/head/meta/4DTaskSequence.json  Get All meta data for 4D Sequence Tags
	 * @apiName getAllIdsWith4DSequenceTag
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 */
	router.get("/revision/master/head/meta/4DTaskSequence.json", middlewares.hasReadAccessToModel, getAllIdsWith4DSequenceTag);

	/**
	 * @api {get} /:teamspace/:model/revision/:rev/meta/4DTaskSequence.json  Get All meta data with 4D Sequence Tags by revision
	 * @apiName getAllIdsWith4DSequenceTag
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} rev Revision
	 */
	router.get("/revision/:rev/meta/4DTaskSequence.json", middlewares.hasReadAccessToModel, getAllIdsWith4DSequenceTag);

	/**
	 * @api {get} /:teamspace/:model/revision/master/head/meta/all.json  Get all meta data
	 * @apiName getAllMetadata
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 */
	router.get("/revision/master/head/meta/all.json", middlewares.hasReadAccessToModel, getAllMetadata);

	/**
	 * @api {get} /:teamspace/:model/revision/:rev/meta/all.json  Get all meta data
	 * @apiName getAllMetadata
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} rev Revision to get meta data from
	 */
	router.get("/revision/:rev/meta/all.json", middlewares.hasReadAccessToModel, getAllMetadata);

	/**
	 * @api {get} /:teamspace/:model/meta/keys Get array of metadata fields
	 * @apiName getMetadataFields
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 */
	router.get("/meta/keys", middlewares.hasReadAccessToModel, getMetadataFields);

	/**
	 * @api {get} /:teamspace/:model/meta/:id.json	Get meta data
	 * @apiName getMetadata
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam id Meta Unique ID
	 */
	router.get("/meta/:id.json", middlewares.hasReadAccessToModel, getMetadata);

	/**
	 * @api {get} /:teamspace/:model/revision/master/head/meta/findObjsWith/:metaKey.json  Get All ids with the meta data field
	 * @apiName getAllIdsWithMetadataField
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} metaKey Unique meta key
	 */
	router.get("/revision/master/head/meta/findObjsWith/:metaKey.json", middlewares.hasReadAccessToModel, getAllIdsWithMetadataField);

	/**
	 * @api {get} /:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json	Get all meta data with field based on revision
	 * @apiName getAllIdsWithMetadataField
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} rev Revision to get meta data from
	 * @apiParam {String} metaKey Unique meta key
	 */
	router.get("/revision/:rev/meta/findObjsWith/:metaKey.json", middlewares.hasReadAccessToModel, getAllIdsWithMetadataField);

	/**
	 * @api {get} /:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json	Get all meta data with field based on master branch
	 * @apiName getAllIdsWithMetadataField
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} rev Revision to get meta data from
	 * @apiParam {String} metaKey metadata field to search for
	 */
	router.get("/revision/master/head/meta/findObjsWith/:metaKey.json", middlewares.hasReadAccessToModel, getAllIdsWithMetadataField);

	const getDbColOptions = function (req) {
		return { account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger };
	};

	function getMetadata(req, res, next) {
		ModelHelpers.getMetadata(req.params.account, req.params.model, req.params.id)
			.then(meta => {
				responseCodes.respond(
					utils.APIInfo(req),
					req,
					res,
					next,
					responseCodes.OK,
					{ meta: [meta] }
				);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function getAllMetadata(req, res, next) {
		let branch;

		if (!req.params.rev) {
			branch = C.MASTER_BRANCH_NAME;
		}

		ModelHelpers.getAllMetadata(req.params.account, req.params.model, branch, req.params.rev)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function getAllIdsWith4DSequenceTag(req, res, next) {
		let branch;

		if (!req.params.rev) {
			branch = C.MASTER_BRANCH_NAME;
		}

		ModelHelpers.getAllIdsWith4DSequenceTag(req.params.account, req.params.model, branch, req.params.rev)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function getAllIdsWithMetadataField(req, res, next) {
		let branch;

		if (!req.params.rev) {
			branch = C.MASTER_BRANCH_NAME;
		}

		ModelHelpers.getAllIdsWithMetadataField(req.params.account, req.params.model, branch, req.params.rev, req.params.metaKey)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function getMetadataFields(req, res, next) {
		const dbCol = getDbColOptions(req);

		Meta.getMetadataFields(dbCol.account, dbCol.model)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	module.exports = router;
}());
