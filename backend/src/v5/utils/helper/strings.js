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

const StringHelper = {};
// Turns thisIsUs to THIS_IS_US
StringHelper.toConstantCase = (str) => snakeCase(str).toUpperCase();
StringHelper.toCamelCase = (str) => camelCase(str);
StringHelper.sanitiseRegex = (str) => str.replace(/(\W)/g, '\\$1');
StringHelper.toBoolean = (str) => str?.toLowerCase() === 'true';

// e.g. URL `https://3drepo.org/abc/xyz` this returns `https://3drepo.org`
// returns the whole string if the regex is not matched
StringHelper.getURLDomain = (url) => {
	const domainRegexMatch = url.match(/^(\w)*:\/\/.*?\//);
	return domainRegexMatch ? domainRegexMatch[0].replace(/\/\s*$/, '') : url;
};

StringHelper.generateHashString = (length = 32) => crypto.randomBytes(length / 2).toString('hex');
StringHelper.toBase64 = (str) => Buffer.from(str).toString('base64');
StringHelper.fromBase64 = (str) => Buffer.from(str, 'base64').toString('ascii');

StringHelper.formatPronouns = (str) => {
	const strArr = str.toLowerCase().split(' ');
	return strArr.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

StringHelper.splitName = (str) => {
	const regexSplitForName = /\s(.*)/;
	const [firstName, lastName] = str?.split(regexSplitForName);
	return [firstName ?? 'Anonymous', lastName ?? 'User'];
};

StringHelper.escapeRegexChrs = (text) => text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');

module.exports = StringHelper;
