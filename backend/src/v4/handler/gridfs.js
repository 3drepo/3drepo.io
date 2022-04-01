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

class GridFSHandler {
	constructor() {

	}

	cleanColName(col) {
		return col.endsWith(".ref") ? col.slice(0, -4) : col;
	}

	getFileStream(account, col, file) {
		return DB.getFileStreamFromGridFS(account, this.cleanColName(col), file).then((fileInfo) => {
			return fileInfo.stream;
		});
	}

	getFile(account, col, file) {
		return DB.getFileFromGridFS(account, this.cleanColName(col), file);
	}

	storeFile(account, col, data) {
		const _id = utils.generateUUID({string: true});
		return DB.storeFileInGridFS(account, this.cleanColName(col), _id, data).then(() => (
			{_id, link: _id, size: data.length, type: "gridfs"}
		));
	}

	removeFiles(teamspace, col, keys) {
		return Promise.all(
			keys.map(async (key) => {
				const collection = this.cleanColName(col);
				const gridFSRef = await DB.findOneAndDelete(teamspace, `${collection}.files`,
					{ filename: key}, { _id: 1 });
				if (gridFSRef) {
					await DB.deleteMany(teamspace, `${collection}.chunks`, { files_id: gridFSRef._id });
				}
			})
		);
	}

}

module.exports = new GridFSHandler();
