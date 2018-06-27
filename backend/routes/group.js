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

const express = require("express");
const router = express.Router({mergeParams: true});
const middlewares = require("../middlewares/middlewares");
const C = require("../constants");
const responseCodes = require("../response_codes.js");
const Group = require("../models/group");
const utils = require("../utils");
const systemLogger = require("../logger.js").systemLogger;

router.get("/groups/revision/master/head/", middlewares.issue.canView, listGroups);
router.get("/groups/revision/:rid/", middlewares.issue.canView, listGroups);
router.get("/groups/revision/master/head/:uid", middlewares.issue.canView, findGroup);
router.get("/groups/revision/:rid/:uid", middlewares.issue.canView, findGroup);

router.put("/groups/:uid", middlewares.issue.canCreate, updateGroup);
router.post("/groups/", middlewares.issue.canCreate, createGroup);
router.delete("/groups/:id", middlewares.issue.canCreate, deleteGroup);
router.delete("/groups/", middlewares.issue.canCreate, deleteGroups);

const getDbColOptions = function(req) {
	return {account: req.params.account, model: req.params.model, logger: req[C.REQ_REPO].logger};
};

function listGroups(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	let groupList;
	if (req.params.rid) {
		groupList = Group.listGroups(dbCol, req.query, null, req.params.rid);
	} else {
		groupList = Group.listGroups(dbCol, req.query, "master", null);
	}

	groupList.then(groups => {

		groups.forEach((group, i) => {
			groups[i] = group.clean();
		});

		responseCodes.respond(place, req, res, next, responseCodes.OK, groups);

	}).catch(err => {

		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);

	});
}

function findGroup(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	let groupItem;
	if (req.params.rid) {
		groupItem = Group.findByUIDSerialised(dbCol, req.params.uid, null, req.params.rid);
	} else {
		groupItem = Group.findByUIDSerialised(dbCol, req.params.uid, "master", null);
	}

	groupItem.then(group => {
		if(!group) {
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		} else {
			return Promise.resolve(group);
		}
	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

function createGroup(req, res, next) {

	const place = utils.APIInfo(req);

	const create = Group.createGroup(getDbColOptions(req), req.body);

	create.then(group => {

		responseCodes.respond(place, req, res, next, responseCodes.OK, group);

	}).catch(err => {
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err);
	});
}

function deleteGroup(req, res, next) {

	if (!req.query.ids || "[object Array]" !== Object.prototype.toString.call(req.query.ids)) {
		req.query.ids = [];
	}

	req.query.ids.push(req.params.id);

	return deleteGroup(req, res, next);
}

function deleteGroups(req, res, next) {
	const place = utils.APIInfo(req);

	if (req.query.ids) {
		const ids = req.query.ids.split(",");

		Group.deleteGroups(getDbColOptions(req), ids).then(() => {
			responseCodes.respond(place, req, res, next, responseCodes.OK, { "status": "success"});
		}).catch(err => {
			responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
		});
	} else {
		// responseCodes.respond(place, req, res, next, responseCodes.INVALID_ARGUMENTS, responseCodes.INVALID_ARGUMENTS);
		responseCodes.respond(place, req, res, next, { message: "Missing or invalid arguments", status: 400 }, { message: "Missing or invalid arguments", status: 400 });
	}
}

function updateGroup(req, res, next) {

	const dbCol = getDbColOptions(req);
	const place = utils.APIInfo(req);

	let groupItem;
	if (req.params.rid) {
		groupItem = Group.findByUID(dbCol, req.params.uid, null, req.params.rid);
	} else {
		groupItem = Group.findByUID(dbCol, req.params.uid, "master", null);
	}

	groupItem.then(group => {

		if(!group) {
			return Promise.reject({resCode: responseCodes.GROUP_NOT_FOUND});
		} else {
			return group.updateAttrs(dbCol, req.body);
		}

	}).then(group => {
		responseCodes.respond(place, req, res, next, responseCodes.OK, group);
	}).catch(err => {
		systemLogger.logError(err.stack);
		responseCodes.respond(place, req, res, next, err.resCode || utils.mongoErrorToResCode(err), err.resCode ? {} : err);
	});
}

module.exports = router;
