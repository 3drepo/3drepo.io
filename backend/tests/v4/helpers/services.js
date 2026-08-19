/**
 *  Copyright (C) 2026 3D Repo Ltd
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

// v4 equivalent of tests/v5/helper/services.js's generateRandomString, kept
// as its own small helper rather than importing the (v5-specific) service
// helper wholesale.
const Crypto = require("crypto");

const ServiceHelper = {};

ServiceHelper.generateRandomString = (l = 20) => (l ? `${Crypto.randomBytes(Math.ceil(l / 2)).toString("hex").slice(0, l - 1)}a` : "");

module.exports = ServiceHelper;
