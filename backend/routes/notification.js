/**
 *  Copyright (C) 2018 3D Repo Ltd
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
const responseCodes = require("../response_codes");
const middlewares = require("../middlewares/middlewares");
const notification = require("../models/notification");

/**
 * @api {get} /notifications Get all notifications
 * @apiName getNotifications
 * @apiGroup Notification
 */
router.get("/", middlewares.loggedIn, getNotifications, responseCodes.onSuccessfulOperation);

/**
 * @api {get} /notifications/:id Get a notification
 * @apiName getNotification
 * @apiGroup Notification
 *
 * @apiParam {String} id Unique Notification ID
 */
router.get("/:id", middlewares.loggedIn, getNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {patch} /notifications/:id Patch a notification
 * @apiName patchNotification
 * @apiGroup Notification
 *
 * @apiParam {String} id Unique Notification ID
 */
router.patch("/:id", middlewares.loggedIn, patchNotification, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /notifications Delete All notification
 * @apiName deleteAllNotifications
 * @apiGroup Notification
 */
router.delete("/", middlewares.loggedIn, deleteAllNotifications, responseCodes.onSuccessfulOperation);

/**
 * @api {delete} /notifications/:id Delete a notification
 * @apiName deleteNotification
 * @apiGroup Notification
 *
 * @apiParam id Unique Notification ID
 */
router.delete("/:id", middlewares.loggedIn, deleteNotification, responseCodes.onSuccessfulOperation);

/**
 * Gets all notifications for the user.
 * Uses logged username as the collection name.
 */
function getNotifications(req, res, next) {
	const username = req.session.user.username;

	notification.getNotifications(username).then(notifications => {
		req.dataModel = notifications;
		next();
	}).catch(err => responseCodes.onError(req, res, err));
}

/**
 * Gets a particular notification.
 * Uses /:id as query param.
 * Uses logged username as the collection name.
 */
function getNotification(req, res, next) {
	const _id = req.params.id;
	const username = req.session.user.username;

	notification.getNotifications(username, {_id : _id}).then(notifications => {
		req.dataModel = notifications[0];
		next();
	}).catch(err => responseCodes.onError(req, res, err));
}

/**
 * Patches a particular notification.
 * Uses /:id as search param.
 * Uses logged username as the collection name.
 * Uses req.body as the partial notification
 */
function patchNotification(req, res, next) {
	const username = req.session.user.username;
	const _id = req.params.id;
	const data = req.body;
	notification.updateNotification(username, _id, data).then(()=> {
		req.dataModel = Object.assign({_id}, data);
		next();
	}).catch(err => responseCodes.onError(req, res, err));
}

/**
 * Deletes a particular notification
 * Uses /:id
 * Uses logged username as the collection name.
 */
function deleteNotification(req, res, next) {
	const username = req.session.user.username;
	const _id = req.params.id;
	notification.deleteNotification(username, _id).then(queryRes => {
		if (queryRes.deletedCount === 0) {
			throw {resCode: responseCodes.NOTIFICATION_NOT_FOUND};
		}  else {
			req.dataModel = Object.assign({_id});
			next();
		}
	}).catch(err => responseCodes.onError(req, res, err));
}

/**
 * Deletes all notifications for a user
 * Uses logged username as the collection name.
 */
function deleteAllNotifications(req, res, next) {
	const username = req.session.user.username;
	notification.deleteAllNotifications(username).then(()=> {
		req.dataModel = {};
		next();
	}).catch(err => responseCodes.onError(req, res, err));
}
module.exports = router;
