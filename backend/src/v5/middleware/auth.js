/**
 *  Copyright (C) 2021 3D Repo Ltd
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

const { isAccountActive } = require('../models/users');
const { isAccountLocked } = require('../models/loginRecords');
const { isSessionValid } = require('../utils/sessions');
const { respond } = require('../utils/responder');
const { templates } = require('../utils/responseCodes');
const { validateMany } = require('./common');

const AuthMiddleware = {};

AuthMiddleware.validSession = async (req, res, next) => {
	const { headers, session } = req;
	if (isSessionValid(session, headers.referer)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.isLoggedIn = async (req, res, next) => {
	const { headers, session } = req;
	if (isSessionValid(session, headers.referer, true)) {
		await next();
	} else {
		respond(req, res, templates.notLoggedIn);
	}
};

AuthMiddleware.notLoggedIn = async (req, res, next) => {
	const { headers, session } = req;
	if (isSessionValid(session, headers.referer, true)) {
		respond(req, res, templates.alreadyLoggedIn);
	} else {
		await next();
	}
};

const accountActive = async (req, res, next) => {
	const { user } = req.body;
	try {
		if (!await isAccountActive(user)) {
			throw templates.userNotVerified;
		}
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

const accountNotLocked = async (req, res, next) => {
	const { user } = req.body;
	try {
		if (await isAccountLocked(user)) {
			throw templates.tooManyLoginAttempts;
		}
		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

AuthMiddleware.canLogin = validateMany([AuthMiddleware.notLoggedIn, accountActive, accountNotLocked]);

module.exports = AuthMiddleware;
