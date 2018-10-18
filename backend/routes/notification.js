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

router.get("/notifications", middlewares.loggedIn, getNotifications, responseCodes.onSuccessfulOperation);
router.patch("/notifications/:id", middlewares.loggedIn, patchNotification, responseCodes.onSuccessfulOperation);

//
function getNotifications(req, res, next) {
	const username = req.session.user.username;

	notification.getNotifications(username).then(notifications => {
		req.dataModel = notifications;
		next();
	}).catch(err => responseCodes.onError(req, res, err));
}

function patchNotification(req, res, next) {
	const username = req.session.user.username;
	const _id = req.params.id;
	const data = req.body;
	notification.updateNotification(username, _id, data).then(()=> {
		req.dataModel = Object.assign({_id}, data);
		next();
	})
		.catch(err => responseCodes.onError(req, res, err));
}

module.exports = router;
