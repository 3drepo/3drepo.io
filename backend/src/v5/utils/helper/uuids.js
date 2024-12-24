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

const Mongo = require('mongodb');
const Objects = require('./objects');
const UUIDParse = require('uuid-parse');
const NodeUUID = require('uuid').v4;
const { isUUIDString } = require('./typeCheck');

const UuidUtils = {};

UuidUtils.generateUUID = () => UuidUtils.stringToUUID(NodeUUID());

UuidUtils.generateUUIDString = () => NodeUUID();

UuidUtils.stringToUUID = (uuid) => {
	if (!isUUIDString(uuid) || uuid === '') return uuid;
	const bytes = UUIDParse.parse(uuid);
	// eslint-disable-next-line new-cap
	const buf = new Buffer.from(bytes);
	return Mongo.Binary(buf, 3);
};

UuidUtils.UUIDToString = (uuid) => {
	try {
		return UUIDParse.unparse(uuid.buffer);
	} catch {
		return uuid;
	}
};

class LookUpTable {
	constructor(ids) {
		this.items = new Set(ids?.length ? ids.map(UuidUtils.UUIDToString) : []);
	}

	has(id) {
		return this.items.has(UuidUtils.UUIDToString(id));
	}

	add(id) {
		this.items.add(UuidUtils.UUIDToString(id));
	}
}

UuidUtils.UUIDLookUpTable = LookUpTable;
module.exports = UuidUtils;
