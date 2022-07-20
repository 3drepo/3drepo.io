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

const Sso = {};

Sso.addPkceProtection = async (req, res, next) => {
	const cryptoProvider = new CryptoProvider();
	const { verifier, challenge } = await cryptoProvider.generatePkceCodes();

	if (!req.session.pkceCodes) {
		req.session.pkceCodes = { challengeMethod: 'S256' };
	}

	req.session.pkceCodes.verifier = verifier;
	req.session.pkceCodes.challenge = challenge;

	await next();
};

module.exports = Sso;
