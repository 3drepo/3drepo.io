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

const Yup = require('yup');
const config = require('../../../utils/config');
const { generateTemplateFn } = require('./common');
const { modelTypes } = require('../../../models/modelSettings.constants');

const TEMPLATE_PATH = `${__dirname}/html/modelImportError.html`;

const dataSchema = Yup.object({
	errInfo: Yup.object({
		code: Yup.number(),
		message: Yup.string().default('Unknown'),
	}),
	title: Yup.string().default('Model Import Error'),
	domain: Yup.string().default(() => config.getBaseURL()),
	teamspace: Yup.string(),
	project: Yup.string(),
	model: Yup.string(),
	modelType: Yup.string().oneOf(Object.values(modelTypes)),
	user: Yup.string(),
	revId: Yup.string(),
	logExcerpt: Yup.string().default('No logs found.'),

}).required(true);

const ModelImportErrorTemplate = {};
ModelImportErrorTemplate.subject = (data) => {
	const { domain, title, modelType } = dataSchema.cast(data);
	return `[${domain}][${modelType}] ${title}`;
};

ModelImportErrorTemplate.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = ModelImportErrorTemplate;
