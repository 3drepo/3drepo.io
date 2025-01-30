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

// appUrl, key , clientId
const { sso: { frontegg: config } } = require('../../../utils/config');
const queryString = require('querystring');

const FrontEgg = {};
/*
FrontEgg.authenticate = async () => {
	const headers = {
   		Authorization: `Basic ${config.key}`,
   	};

   	const payload = {
   		grant_type: 'authorization_code',
   		code,
   		redirect_uri: 'https://www.3drepo.local:443/api/v5/sso/aad/authenticate-post',
   		code_challenge: challenge,
   	};
};
*/

FrontEgg.getAuthenticationCodeUrl = ({ state, redirectURL, codeChallenge }) => {
	const qsObj = {
		response_type: 'code',
		scope: 'openId',
		client_id: config.clientId,
		state,
		redirect_uri: redirectURL,
		code_challenge: codeChallenge,
	};

	return `${config.appUrl}/oauth/authorize?${queryString.encode(qsObj)}`;
};

module.exports = FrontEgg;
