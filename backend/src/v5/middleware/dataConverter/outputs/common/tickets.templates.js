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
const { cloneDeep } = require('../../../../utils/helper/objects');
const { propTypes } = require('../../../../schemas/tickets/templates.constants');

const TicketTemplate = {};

TicketTemplate.serialiseTicketTemplate = (template, dropDeprecated = false) => {
	const res = cloneDeep(template);
	res._id = UUIDToString(res._id);

	const processProperty = (prop) => {
		if (dropDeprecated && prop.deprecated) return false;
		if (prop.type === propTypes.DATE && prop.default) {
			// Convert date to ms since epoch
			// eslint-disable-next-line no-param-reassign
			prop.default = new Date(prop.default).getTime();
		}

		return true;
	};

	res.properties = res.properties.filter(processProperty);
	res.modules = res.modules.filter((mod) => {
		if (dropDeprecated && mod.deprecated) return false;

		// eslint-disable-next-line no-param-reassign
		mod.properties = mod.properties.filter(processProperty);
		return true;
	});

	return res;
};

module.exports = TicketTemplate;
