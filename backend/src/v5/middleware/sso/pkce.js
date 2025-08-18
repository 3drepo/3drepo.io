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
const { generateUUIDString } = require('../../utils/helper/uuids');

const Sso = {};

const createRandomString = (length = 16) => {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (let i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
};

const generateCodeChallenge = async (codeVerifier) => {
	const digest = await crypto.subtle.digest('SHA-256',
		new TextEncoder().encode(codeVerifier));

	// @ts-ignore
	return btoa(String.fromCharCode(...new Uint8Array(digest)))
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
};

const generatePkceCodes = async () => {
	// from https://developers.frontegg.com/guides/management/frontegg-idp/native-hosted#step-2-generating-verifier-and-challenge-code
	const verifier = createRandomString();
	const challenge = await generateCodeChallenge(verifier);

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
