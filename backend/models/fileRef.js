/**
 *  Copyright (C) 2018 3D Repo Ltd
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

"use strict";
const DB = require("../handler/db");
const ExternalServices = require("../handler/externalServices");
const ResponseCodes = require("../response_codes");

const ORIGINAL_FILE_REF_EXT = ".history.ref";

function getRefEntry(account, collection, fileName) {
	return DB.getCollection(account, collection).then((col) => {
		return col.findOne({_id: fileName});
	});
}

function fetchFile(account, collection, fileName) {
	return getRefEntry(account, collection, fileName).then((entry) => {
		if(!entry) {
			return Promise.reject(ResponseCodes.NO_FILE_FOUND);
		}
		return { readStream: ExternalServices.getFile(entry.type, entry.link), size: entry.size };
	});
}

const FileRef = {};

FileRef.getOriginalFile = function(account, model, fileName) {
	return fetchFile(account, model + ORIGINAL_FILE_REF_EXT, fileName);
};

FileRef.getTotalOrgFileSize = function(account, model) {
	return DB.getCollection(account, model + ORIGINAL_FILE_REF_EXT).then((col) => {
		if(col) {
			col.aggregate({ "$match": {}}, { "$group": { _id : null, sum : { "$sum": "$size" } } }).then((res) => {
				return res.sum;
			});
		}

		return 0;
	});
};

module.exports = FileRef;
