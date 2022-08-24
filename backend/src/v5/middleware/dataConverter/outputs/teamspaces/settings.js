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

const { UUIDToString } = require('../../../../utils/helper/uuids');
const { propTypes } = require('../../../../schemas/tickets/templates.constants');
const { respond } = require('../../../../utils/responder');
const { templates } = require('../../../../utils/responseCodes');

const Settings = {};

Settings.castTicketSchemaOutput = (req, res) => {
	const template = req.templateData;
	template._id = UUIDToString(template._id);

	const convertDate = (prop) => {
		if (prop.type === propTypes.DATE && prop.default) {
			// Convert date to ms since epoch
			// eslint-disable-next-line no-param-reassign
			prop.default = new Date(prop.default).getTime();
		}
	};

	template.properties.forEach(convertDate);
	template.modules.forEach(({ properties }) => {
		properties.forEach(convertDate);
	});

	respond(req, res, templates.ok, template);
};

module.exports = Settings;
