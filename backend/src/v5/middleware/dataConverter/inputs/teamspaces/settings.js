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

const { createResponseCode, templates } = require('../../../../utils/responseCodes');
const { getTemplateByCode, getTemplateById, getTemplateByName } = require('../../../../models/tickets.templates');
const Yup = require('yup');
const { deleteIfUndefined } = require('../../../../utils/helper/objects');
const { respond } = require('../../../../utils/responder');
const { types } = require('../../../../utils/helper/yup');
const { validate } = require('../../../../schemas/tickets/templates');
const { validateMany } = require('../../../common');

const Settings = {};

const nameExists = (teamspace, name) => getTemplateByName(teamspace, name, { _id: 1 })
	.then(() => true).catch(() => false);

const codeExists = (teamspace, code) => getTemplateByCode(teamspace, code, { _id: 1 })
	.then(() => true).catch(() => false);

const mergeProperties = (newProps, oldProps) => {
	const newDataFields = {};
	newProps.forEach((prop) => { newDataFields[prop.name] = prop; });
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
	newMods.forEach((prop) => { newModsLut[prop.name || prop.type] = prop; });
	oldMods.forEach(({ name, type, ...others }) => {
		const id = name || type;
		if (newModsLut[id]) {
			mergeProperties(newModsLut[id].properties, others.properties);
		} else {
			newMods.push(deleteIfUndefined({ name, type, deprecated: true, ...others }));
		}
	});
};

const processTemplateUpdate = (newData, oldData) => {
	mergeProperties(newData.properties, oldData.properties);
	mergeModules(newData.modules, oldData.modules);
};

const validateUpdateTemplateSchema = async (req, res, next) => {
	const { teamspace } = req.params;

	try {
		const data = validate(req.body);

		const oldTemplate = req.templateData;

		if (oldTemplate.name !== data.name) {
			// if the name has changed, make sure it's not used by some other template
			if (await nameExists(teamspace, data.name)) throw new Error('Name already in use');
		}

		if (oldTemplate.code !== data.code) {
			// if the code has changed, make sure it's not used by some other template
			if (await codeExists(teamspace, data.code)) throw new Error('Code already in use');
		}

		processTemplateUpdate(data, oldTemplate);
		req.body = data;

		await next();
	} catch (err) {
		const response = createResponseCode(templates.invalidArguments, err?.message);
		respond(req, res, response);
	}
};

Settings.validateNewTicketSchema = async (req, res, next) => {
	const { teamspace } = req.params;
	const data = req.body;

	try {
		req.body = validate(data);

		if (await nameExists(teamspace, data.name)) throw new Error('Name already in use');
		if (await codeExists(teamspace, data.code)) throw new Error('Code already in use');

		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err?.message));
	}
};

Settings.checkTicketTemplateExists = async (req, res, next) => {
	const { teamspace, template } = req.params;
	try {
		req.templateData = await getTemplateById(teamspace, template);

		await next();
	} catch (err) {
		respond(req, res, err);
	}
};

Settings.validateUpdateTicketSchema = validateMany([Settings.checkTicketTemplateExists, validateUpdateTemplateSchema]);

Settings.validateGetActivitiesParams = async (req, res, next) => {
	const schema = Yup.object({
		from: types.date,
		to: types.date,
	});

	try {
		req.query = await schema.validate(req.query, { stripUnknown: true });
		await next();
	} catch (err) {
		respond(req, res, createResponseCode(templates.invalidArguments, err.message));
	}
};

module.exports = Settings;
