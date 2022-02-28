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

const { camelCase, snakeCase } = require('lodash');
const crypto = require('crypto');
const { types } = require('./yup');

const StringHelper = {};
// Turns thisIsUs to THIS_IS_US
StringHelper.toConstantCase = (str) => snakeCase(str).toUpperCase();
StringHelper.toCamelCase = (str) => camelCase(str);

// e.g. URL `https://3drepo.org/abc/xyz` this returns `https://3drepo.org`
// returns the whole string if the regex is not matched
StringHelper.getURLDomain = (url) => {
	const domainRegexMatch = url.match(/^(\w)*:\/\/.*?\//);
	return domainRegexMatch ? domainRegexMatch[0].replace(/\/\s*$/, '') : url;
};

StringHelper.hasEmailFormat = (str) => types.strings.email.isValidSync(str, { strict: true });

StringHelper.generateHashString = (length = 32) => crypto.randomBytes(length / 2).toString('hex');

module.exports = StringHelper;
