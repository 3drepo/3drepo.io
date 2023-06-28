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

const DB = require("./db");
const utils = require("../utils");

const cleanColName = (col) => col.endsWith(".ref") ? col.slice(0, -4) : col;

class GridFSHandler {
	constructor() {

	}

	getFileStream(account, col, file) {
		return DB.getFileStreamFromGridFS(account, cleanColName(col), file).then((fileInfo) => {
			return fileInfo.stream;
		});
	}

	getFile(account, col, file, chunkInfo) {
		if(chunkInfo) {
			return Promise.reject("Partial file read is not supported");
		}
		return DB.getFileFromGridFS(account, cleanColName(col), file);
	}

	storeFile(account, col, data, id) {
		const _id = id || utils.generateUUID({string: true});
		return DB.storeFileInGridFS(account, cleanColName(col), _id, data).then(() => (
			{_id, link: _id, size: data.length, type: "gridfs"}
		));
	}

	async removeFiles(teamspace, col, keys) {
		const collection = cleanColName(col);
		const res = await DB.find(teamspace, `${collection}.files`, { filename: {$in: keys}}, {_id: 1});
		const ids = res.map(({_id}) => _id);
		const query = {$in: ids};
		return Promise.all([
			DB.deleteMany(teamspace, `${collection}.files`, { _id: query}),
			DB.deleteMany(teamspace, `${collection}.chunks`, { files_id: query })
		]);
	}

}

module.exports = new GridFSHandler();
