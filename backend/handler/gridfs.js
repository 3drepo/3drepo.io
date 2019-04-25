/**
 *	Copyright (C) 2018 3D Repo Ltd
 *
 *	This program is free software: you can redistribute it and/or modify
 *	it under the terms of the GNU Affero General Public License as
 *	published by the Free Software Foundation, either version 3 of the
 *	License, or (at your option) any later version.
 *
 *	This program is distributed in the hope that it will be useful,
 *	but WITHOUT ANY WARRANTY; without even the implied warranty of
 *	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *	GNU Affero General Public License for more details.
 *
 *	You should have received a copy of the GNU Affero General Public License
 *	along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const responseCodes = require("../response_codes");

// Stub for future implementation
class GridFSHandler {
	constructor() {

	}

	getFileStream() {
		return Promise.reject(responseCodes.UNSUPPORTED_STORAGE_TYPE);
	}

	getFile() {
		return Promise.reject(responseCodes.UNSUPPORTED_STORAGE_TYPE);
	}

	removeFiles() {
		return Promise.reject(responseCodes.UNSUPPORTED_STORAGE_TYPE);
	}

}

module.exports = new GridFSHandler();
