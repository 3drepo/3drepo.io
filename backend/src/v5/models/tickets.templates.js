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

const Templates = {};

const TEMPLATES_COL = 'templates';
const db = require('../handler/db');
const { defaultTemplates } = require('./tickets.templates.constants');
const { generateUUID } = require('../utils/helper/uuids');
const { templates } = require('../utils/responseCodes');

const findOne = async (teamspace, query, projection) => {
	const template = await db.findOne(teamspace, TEMPLATES_COL, query, projection);
	if (!template) {
		throw templates.templateNotFound;
	}

	return template;
};

const find = (teamspace, query, projection) => db.find(teamspace, TEMPLATES_COL, query, projection);

Templates.addDefaultTemplates = (teamspace) => db.insertMany(teamspace, TEMPLATES_COL, defaultTemplates);

Templates.addTemplate = async (teamspace, template) => {
	const _id = generateUUID();
	await db.insertOne(teamspace, TEMPLATES_COL, { ...template, _id });
	return _id;
};

Templates.getTemplateById = (teamspace, _id, projection) => findOne(teamspace, { _id }, projection);

Templates.getTemplateByName = (teamspace, name, projection) => findOne(teamspace, { name }, projection);
Templates.getTemplateByCode = (teamspace, code, projection) => findOne(teamspace, { code }, projection);

Templates.updateTemplate = async (teamspace, _id, data) => {
	await db.replaceOne(teamspace, TEMPLATES_COL, { _id }, { ...data, _id });
};

Templates.getTemplatesByQuery = find;

Templates.getAllTemplates = (teamspace, includeDeprecated, projection) => {
	const query = includeDeprecated ? { } : { deprecated: { $ne: true } };
	return find(teamspace, query, projection);
};

Templates.deleteTemplates = async (teamspace, templateIds) => {
	if (!templateIds?.length) return;
	await db.deleteMany(teamspace, TEMPLATES_COL, { _id: { $in: templateIds } });
};

module.exports = Templates;
