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

const { UUIDToString } = require('../../../../../../../utils/helper/uuids');
const { respond } = require('../../../../../../../utils/responder');
const { templates } = require('../../../../../../../utils/responseCodes');

const Views = {};

Views.serialiseViews = (req, res) => {
	const views = req.outputData.map((view) => {
		const output = { ...view };
		output._id = UUIDToString(view._id);
		output.hasThumbnail = !!(output.thumbnail?.buffer
			|| output.thumbnail?.content?.buffer
			|| output.screenshot?.buffer);

		delete output.thumbnail;
		delete output.screenshot;
		return output;
	});

	respond(req, res, templates.ok, { views });
};

module.exports = Views;
