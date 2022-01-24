/**
 *  Copyright (C) 2022 3D Repo Ltd
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

const Views = {};
const { getViewById, getViews } = require('../../../../../models/views');
const { templates } = require('../../../../../utils/responseCodes');

Views.getViewList = (teamspace, model) => {
	const projection = {
		_id: 1,
		name: 1,
		thumbnail: 1,
	};

	return getViews(teamspace, model, projection);
};

Views.getThumbnail = async (teamspace, model, view) => {
	// Legacy: thumbnail used stored inside screenshot instead of thumbnail
	const projection = { thumbnail: 1, screenshot: 1, _id: 0 };
	const { thumbnail, screenshot } = await getViewById(teamspace, model, view, projection);

	const img = thumbnail || screenshot;
	if (img) {
		// Legacy: image buffer may be instead content
		const buffer = img.buffer || img.content?.buffer;

		if (buffer) {
			return buffer;
		}
	}

	throw templates.thumbnailNotFound;
};

module.exports = Views;
