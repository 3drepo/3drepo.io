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

const { CryptoProvider } = require('@azure/msal-node');
const config = require('../../utils/config');

const Sso = {};

const cryptoProvider = new CryptoProvider();

Sso.addPkceProtection = async (req, res, next) => {
	const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

	req.session.csrfToken = cryptoProvider.createNewGuid();
	req.session.pkceCodes = { challengeMethod: 'S256', verifier, challenge };
	req.session.cookie.domain = config.cookie_domain;

	await next();
};

module.exports = Sso;
