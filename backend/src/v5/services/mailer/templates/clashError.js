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

const Yup = require('yup');
const config = require('../../../utils/config');
const { generateTemplateFn } = require('./common');

const TEMPLATE_PATH = `${__dirname}/html/clashError.html`;

const subjectDef = {
	title: Yup.string().default('Clash Error'),
	domain: Yup.string().default(() => config.getBaseURL()),
};

const dataSchema = Yup.object({
	...subjectDef,
	teamspace: Yup.string().required(),
	project: Yup.string().required(),
	planId: Yup.string().required(),
	runId: Yup.string().required(),
	errorMessage: Yup.string().required(),
}).required(true);

const ClashErrorTemplate = {};

ClashErrorTemplate.subject = (data = {}) => {
	const subjectSchema = Yup.object(subjectDef);
	const { domain, title } = subjectSchema.cast(data ?? {}, { assert: false });
	return `[${domain}] ${title}`;
};

ClashErrorTemplate.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = ClashErrorTemplate;
