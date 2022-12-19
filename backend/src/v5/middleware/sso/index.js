/**
 *  Copyright (C) 2022 3D Repo Ltd
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
const { createResponseCode, templates } = require('../../utils/responseCodes');
const { URL } = require('url');
const Yup = require('yup');
const { getURLDomain } = require('../../utils/helper/strings');
const { getUserFromSession } = require('../../utils/sessions');
const { isSsoUser } = require('../../models/users');
const { respond } = require('../../utils/responder');
const { types } = require('../../utils/helper/yup');

const Sso = {};

Sso.redirectWithError = (res, url, errorCode) => {
	const urlRedirect = new URL(url);
	urlRedirect.searchParams.set('error', errorCode);
	res.redirect(urlRedirect.href);
};

Sso.setSessionReferer = async (req, res, next) => {
	if (req.headers.referer) {
		req.session.referer = getURLDomain(req.headers.referer);
	}

	await next();
};

Sso.isSsoUser = async (req, res, next) => {
	try {
		const username = getUserFromSession(req.session);
		if (!await isSsoUser(username)) {
			throw templates.nonSsoUser;
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Sso.isNonSsoUser = async (req, res, next) => {
	try {
		const username = getUserFromSession(req.session);
		if (await isSsoUser(username)) {
			throw templates.ssoUser;
		}

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Sso.validateUnlinkData = async (req, res, next) => {
	const schema = Yup.object().shape({
		password: types.strings.password.required(),
	}).strict(true).noUnknown()
		.required();

	try {
		await schema.validate(req.body);
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

module.exports = Sso;
