/**
 *  Copyright (C) 2025 3D Repo Ltd
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
const { src } = require('../../path');

const { deleteIfUndefined } = require(`${src}/utils/helper/objects`);
const { generateHashString } = require(`${src}/utils/helper/strings`);
const queryString = require('querystring');

const Auth = {};

Auth.getUserInfoFromToken = jest.fn();

Auth.validateToken = () => Promise.resolve();

Auth.generateAuthenticationCodeUrl = ({ state, redirectURL, codeChallenge }, accountId) => {
	const qsObj = deleteIfUndefined({
		response_type: 'code',
		scope: 'openId',
		state,
		redirect_uri: redirectURL,
		code_challenge: codeChallenge,
		tenantId: accountId,
	});

	return `https://localhost:12345/oauth/authorize?${queryString.encode(qsObj)}`;
};

Auth.generateToken = () => {
	const expiry = new Date(Date.now() + 24 * 60 * 60000);

	return Promise.resolve({
		token: generateHashString(),
		refreshToken: generateHashString(),
		expiry });
};

module.exports = Auth;
