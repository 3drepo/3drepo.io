/**
 *  Copyright (C) 2026 3D Repo Ltd
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

const { src } = require('./path');
const DataGen = require('./dataGen');

const { generateFullSchema } = require(`${src}/schemas/tickets/templates`);
const { propTypes } = require(`${src}/schemas/tickets/templates.constants`);
const { isArray } = require(`${src}/utils/helper/typeCheck`);

const generateProperties = (propTemplate, internalType, container) => {
	const properties = {};

	propTemplate.forEach(({ name, deprecated, readOnly, type, values }) => {
		if (deprecated || readOnly) return;
		if (type === propTypes.TEXT || type === propTypes.LONG_TEXT) {
			properties[name] = DataGen.generateRandomString();
		} else if (type === propTypes.DATE) {
			properties[name] = internalType ? new Date() : Date.now();
		} else if (type === propTypes.NUMBER) {
			properties[name] = DataGen.generateRandomNumber();
		} else if (type === propTypes.BOOLEAN) {
			properties[name] = DataGen.generateRandomBoolean();
		} else if (type === propTypes.ONE_OF && isArray(values)) {
			properties[name] = values[values.length - 1];
		} else if (type === propTypes.MANY_OF && isArray(values)) {
			properties[name] = values;
		} else if (type === propTypes.TAGS) {
			properties[name] = Array.from({ length: 3 }, () => DataGen.generateRandomString());
		} else if (type === propTypes.COORDS) {
			properties[name] = [0, 0, 0];
		} else if (type === propTypes.VIEW) {
			properties[name] = {
				camera: {
					position: [0, 0, 0],
					forward: [0, 0, 0],
					up: [0, 0, 0],
				},
				state: {
					hidden: [
						{ group: DataGen.generateGroup(true, { serialised: true, hasId: false }) },
						{ group: DataGen.generateGroup(false, { serialised: true, hasId: false, container }) },
					],
				},
			};
		}
	});

	return properties;
};

const generateTicket = (template, internalType = false, container) => {
	const fullTemplate = generateFullSchema(template) ?? template;
	const modules = {};
	(fullTemplate?.modules || []).forEach(({ name, type, deprecated, properties }) => {
		if (deprecated) return;
		const id = name ?? type;
		modules[id] = generateProperties(properties, internalType, container);
	});

	return {
		_id: DataGen.generateUUIDString(),
		type: fullTemplate._id,
		title: DataGen.generateRandomString(),
		properties: generateProperties(fullTemplate.properties, internalType, container),
		modules,
	};
};

module.exports = { generateTicket };
