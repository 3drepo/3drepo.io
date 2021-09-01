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

const _ = require('lodash');
const mongo = require("mongodb");
const uuidparse = require("uuid-parse");

const UUIDHelper = {};

/** *****************************************************************************
* Convert a string to a UUID
* @param {string | Buffer} uuid - String representation of a UUID, or the UUID
* @returns {Buffer} binuuid - Binary representation of a UUID
*******************************************************************************/
UUIDHelper.stringToUUID = (uuid) => {
	if (!_.isString(uuid)) {
		return uuid;
	}

	const bytes = uuidparse.parse(uuid);
	const buf   = new Buffer.from(bytes);

	return mongo.Binary(buf, 3);
};

/** *****************************************************************************
* Convert a binary representation of an UUID to a string
* @param {Buffer} binuuid - Binary representation of a UUID
* @returns {string} uuid - String representation of a UUID
*******************************************************************************/
UUIDHelper.uuidToString = (binuuid) => {
	return (binuuid && !_.isString(binuuid)) ?
		uuidparse.unparse(binuuid.buffer) :
		binuuid;
};

module.exports = UUIDHelper;
