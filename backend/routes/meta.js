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
	const Meta = require("../models/meta");
	const middlewares = require("../middlewares/middlewares");
	const utils = require("../utils");
	const C = require("../constants");
	const config = require("../config");

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
	 * @apiName getAllIdsWith4DSequenceTagRev
	 * @apiGroup Meta
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} rev Revision
	 */
	router.get("/revision/:rev/meta/4DTaskSequence.json", middlewares.hasReadAccessToModel, getAllIdsWith4DSequenceTag);

	/**
	 * @api {get} /:teamspace/:model/revision/master/head/meta/all.json Get all meta data
	 * @apiName getAllMetadata
	 * @apiGroup Meta
	 * @apiDescription Get all objects in the tree with their metadata.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/all.json HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * {
	 *    "data": [
	 *       {
	 *          "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
	 *          "metadata": {
	 *             "IFC Type": "IfcBuilding",
	 *             "IFC GUID": "00tMo7QcxqWdIGvc4sMN2A",
	 *             "BuildingID": "n/a",
	 *             "IsPermanentID": "True",
	 *             "OccupancyType": "Private dwelling",
	 *             "IsLandmarked": "True",
	 *             "NumberOfStoreys": 2
	 *          },
	 *          "parents": [
	 *             "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
	 *          ]
	 *       },
	 *       {
	 *          "_id": "85ad29bd-cd99-4472-a92f-86266b07e57d",
	 *          "metadata": {
	 *             "IFC Type": "IfcSite",
	 *             "IFC GUID": "20FpTZCqJy2vhVJYtjuIce"
	 *          },
	 *          "parents": [
	 *             "48359ad0-9b6d-44ed-ae93-47e2ec69ea88"
	 *          ]
	 *       },
	 *       {
	 *          "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
	 *          "metadata": {
	 *             "IFC Type": "IfcBuildingElementProxy",
	 *             "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
	 *             "Reference": "LegoRoundTree"
	 *          },
	 *          "parents": [
	 *             "2bf2a864-5cb0-41ba-85a8-c2cffc3da06d"
	 *          ]
	 *       },
	 *       {
	 *          "_id": "c4682cf2-7b2a-41c7-8fe2-c0c39512dd99",
	 *          "metadata": {
	 *             "IFC Type": "IfcBuildingStorey",
	 *             "IFC GUID": "1oZ0wPs_PE8ANCPg3bIs4j",
	 *             "AboveGround": "False"
	 *          },
	 *          "parents": [
	 *             "323a9900-ece1-4857-8980-ec96ffc7f681"
	 *          ]
	 *       }
	 *    ]
	 * }
	 *
	 */
	router.get("/revision/master/head/meta/all.json", middlewares.hasReadAccessToModel, getAllMetadata);

	/**
	 * @api {get} /:teamspace/:model/revision/:rev/meta/all.json Get all meta data by revision
	 * @apiName getAllMetadataByRev
	 * @apiGroup Meta
	 * @apiDescription Get all tree objects with their metadata tags by revision.
	 * See more details <a href='#api-Meta-getAllMetadata'>here</a>.
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
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/keys HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * [
	 *    "AboveGround",
	 *    "BuildingID",
	 *    "IFC GUID",
	 *    "IFC Type",
	 *    "IsLandmarked",
	 *    "IsPermanentID",
	 *    "NumberOfStoreys",
	 *    "OccupancyType",
	 *    "Reference"
	 * ]
	 *
	 */
	router.get("/meta/keys", middlewares.hasReadAccessToModel, getMetadataFields);

	/**
	 * @api {get} /:teamspace/:model/meta/:id.json	Get meta data
	 * @apiName getMetadata
	 * @apiGroup Meta
	 * @apiDescription Get all metadata tags by revision. See more details <a href='#api-Meta-getAllMetadata'>here</a>.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam id Meta Unique ID
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/meta/b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963.json HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * {
	 *    "meta": [
	 *       {
	 *          "_id": "b5fe5dcf-ce8c-4b1e-a96b-bdc5aa001963",
	 *          "name": "LegoRoundTree:LegoRoundTree:302403",
	 *          "metadata": {
	 *             "IFC Type": "IfcBuildingElementProxy",
	 *             "IFC GUID": "3VkTAO0fr0XQHS3DxQzfxm",
	 *             "Reference": "LegoRoundTree"
	 *          }
	 *       }
	 *    ]
	 * }
	 *
	 */
	router.get("/meta/:id.json", middlewares.hasReadAccessToModel, getMetadata);

	/**
	 * @api {get} /:teamspace/:model/revision/master/head/meta/findObjsWith/:metaKey.json Get ids by metadata
	 * @apiName getIdsWithMetadataField
	 * @apiGroup Meta
	 * @apiDescription Get ids of tree objects which has a particular metadata key (in the latest revision). It also returns the metadata value for that key.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} metaKey Unique metadata key
	 *
	 * @apiExample {get} Example usage:
	 * GET /teamSpace1/3549ddf6-885d-4977-87f1-eeac43a0e818/revision/master/head/meta/findObjsWith/IsLandmarked.json HTTP/1.1
	 *
	 * @apiSuccessExample {json} Success:
	 * {
	 *    "data": [
	 *       {
	 *          "_id": "2f461edf-4544-412a-bb84-ffdb3bbe563b",
	 *          "metadata": {
	 *             "value": "True"
	 *          },
	 *          "parents": [
	 *             "9eeddbe2-750d-46fb-988f-bcf9ec2ecf51"
	 *          ]
	 *       }
	 *    ]
	 * }
	 *
	 */
	router.get("/revision/master/head/meta/findObjsWith/:metaKey.json", middlewares.hasReadAccessToModel, getAllIdsWithMetadataField);

	/**
	 * @api {get} /:teamspace/:model/revision/:rev/meta/findObjsWith/:metaKey.json Get ids by metadata
	 * @apiName getIdsWithMetadataFieldByRev
	 * @apiGroup Meta
	 * @apiDescription Get ids of tree objects which has a particular metadata key from a particular revision.
	 * See more details <a href='#api-Meta-getIdsWithMetadataField'>here</a>.
	 *
	 * @apiParam {String} teamspace Name of teamspace
	 * @apiParam {String} model Model ID
	 * @apiParam {String} rev Revision to get meta data from
	 * @apiParam {String} metaKey Unique meta key
	 */
	router.get("/revision/:rev/meta/findObjsWith/:metaKey.json", middlewares.hasReadAccessToModel, getAllIdsWithMetadataField);

	const getDbColOptions = function (req) {
		return { account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger };
	};

	function getMetadata(req, res, next) {
		Meta.getMetadata(req.params.account, req.params.model, req.params.id)
			.then(meta => {
				responseCodes.respond(
					utils.APIInfo(req),
					req,
					res,
					next,
					responseCodes.OK,
					{ meta: [meta] },
					undefined,
					{maxAge: 60 * 60 * 24}
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

		Meta.getAllMetadata(req.params.account, req.params.model, branch, req.params.rev)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj, undefined, req.param.rev ? config.cachePolicy : undefined);
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

		Meta.getAllIdsWith4DSequenceTag(req.params.account, req.params.model, branch, req.params.rev)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj, undefined, req.param.rev ? config.cachePolicy : undefined);
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

		Meta.getAllIdsWithMetadataField(req.params.account, req.params.model, branch, req.params.rev, req.params.metaKey)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj, undefined, req.param.rev ? config.cachePolicy : undefined);
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	function getMetadataFields(req, res, next) {
		const dbCol = getDbColOptions(req);

		Meta.getMetadataFields(dbCol.account, dbCol.model)
			.then(obj => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, responseCodes.OK, obj, undefined,  {maxAge: 360});
			})
			.catch(err => {
				responseCodes.respond(utils.APIInfo(req), req, res, next, err, err);
			});
	}

	module.exports = router;
}());
