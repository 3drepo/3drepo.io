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

const config = require('../../utils/config');
const { generateHashString } = require('../../utils/helper/strings');
const { generateUUIDString } = require('../../utils/helper/uuids');
const { subtle } = require('crypto');

const Sso = {};

const generatePkceCodes = async () => {
	const verifier = generateHashString(16);

	const digest = await subtle.digest('SHA-256',
		new TextEncoder().encode(verifier));

	const challenge = Buffer.from(String.fromCharCode(...new Uint8Array(digest))).toString('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');

	return { verifier, challenge };
};

Sso.addPkceProtection = async (req, res, next) => {
	const { verifier, challenge } = await generatePkceCodes();

	req.session.csrfToken = generateUUIDString();
	req.session.pkceCodes = { challengeMethod: 'S256', verifier, challenge };
	req.session.cookie.domain = config.cookie_domain;

	await next();
};

module.exports = Sso;
