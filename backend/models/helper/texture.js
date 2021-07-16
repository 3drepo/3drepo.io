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

"use strict";

const { getGridfsFileStream, getNodeById } = require("../scene");
const utils = require("../../utils");
const responseCodes = require("../../response_codes");

async function getTextureById(account, model, textureId) {

	const projection = {
		"_id": 1,
		"_extRef": 1,
		"extension": 1
	};

	const texture = await getNodeById(account, model, utils.stringToUUID(textureId), projection);
	if (!texture) {
		throw responseCodes.RESOURCE_NOT_FOUND;
	}

	const data = await getGridfsFileStream(account, model, texture._extRef.data);

	const textureInfo = {
		stream: data,
		extension: texture.extension
	};

	return textureInfo;
}

module.exports = {
	getTextureById
};
