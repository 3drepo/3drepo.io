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

const Tickets = {};
const { fieldTypes } = require('./templates.constants');
const { generateFullSchema } = require('./templates');
const { types } = require('../../utils/helper/yup');
const Yup = require('yup');

const generatePropertiesValidator = (properties) => {
	const obj = {};

	properties.forEach((prop) => {
		if (prop.deprecated) return;
		let fieldValidator;
		switch (prop.type) {
			case fieldTypes.TEXT:
				fieldValidator = types.strings.title;
				break;
			case fieldTypes.LONG_TEXT:
				fieldValidator = types.strings.longDescription;
			break;
			case fieldTypes.
			break;
		case fieldTypes.DATE:
			break;
		case fieldTypes.NUMBER:
			break;
		case fieldTypes.ONE_OF:
			break;
		case fieldTypes.IMAGE:
			break;
		case fieldTypes.VIEW:
			break;
		case fieldTypes.MEASUREMENTS:
			break;
		case fieldTypes.ATTACHMENTS:
			break;
		case fieldTypes.SAFETIBASE:
			break;
		case fieldTypes.COORDS:
			break;
		}
	});

	return Yup.object(obj);
};

Tickets.generateTicketValidator = (template) => {
	const fullTem = generateFullSchema(template);
	const validator = Yup.object().shape({
		properties: propertiesValidator(template.properties),
	});
};
module.exports = Tickets;
