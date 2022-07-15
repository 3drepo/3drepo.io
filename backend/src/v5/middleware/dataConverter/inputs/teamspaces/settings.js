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

const { codeExists, createResponseCode, templates } = require('../../../../utils/responseCodes');
const { getTemplateById, getTemplateByName } = require('../../../../models/tickets.templates');
const { respond } = require('../../../../utils/responder');
const { validate } = require('../../../../schemas/tickets/templates');

const Settings = {};

const nameExists = (teamspace, name) => getTemplateByName(teamspace, name, { _id: 1 })
	.then(() => true).catch(() => false);

Settings.validateNewTicketSchema = async (req, res, next) => {
	const { teamspace } = req.params;
	const data = req.body;

	try {
		req.body = validate(data);

		if (await nameExists(teamspace, data.name)) throw new Error('Name already in use');

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

const mergeProperties = (newProps, oldProps) => {
	const newDataFields = {};
	newProps.forEach((field) => { newDataFields[field.name] = field; });
	oldProps.forEach(({ name, type, ...others }) => {
		if (newDataFields[name]) {
			if (newDataFields[name].type !== type) throw new Error(`Cannot change the value type of existing property "${name}"`);
		} else {
			newProps.push({ name, type, deprecated: true, ...others });
		}
	});
};

const mergeModules = (newMods, oldMods) => {
	const newModsLut = {};
	newMods.forEach((field) => { newModsLut[field.name || field.type] = field; });
	oldMods.forEach(({ name, type, ...others }) => {
		const id = name || type;
		if (newModsLut[id]) {
			mergeProperties(newModsLut[id].properties, others.properties);
		} else {
			newMods.push({ name, type, deprecated: true, ...others });
		}
	});
};

const processTemplateUpdate = (newData, oldData) => {
	mergeProperties(newData.properties, oldData.properties);
	mergeModules(newData.modules, oldData.modules);
};

Settings.validateUpdateTicketSchema = async (req, res, next) => {
	const { teamspace, template } = req.params;

	try {
		const data = validate(req.body);

		const oldTemplate = await getTemplateById(teamspace, template);

		if (oldTemplate.name !== data.name) {
			// if the name is changed, make sure it's not used by some other template
			if (await nameExists(teamspace, data.name)) throw new Error('Name already in use');
		}

		processTemplateUpdate(data, oldTemplate);
		req.body = data;

		await next();
	} catch (err) {
		console.log(err);
		const response = codeExists(err?.code) ? err : createResponseCode(templates.invalidArguments, err?.message);
		respond(req, res, response);
	}
};

module.exports = Settings;
