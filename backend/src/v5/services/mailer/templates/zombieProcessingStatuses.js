/**
 *  Copyright (C) 2024 3D Repo Ltd
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

const TEMPLATE_PATH = `${__dirname}/html/zombieProcessingStatuses.html`;

const zombieEntrySchema = Yup.object({
	teamspace: Yup.string().default(''),
	id: Yup.string().default(''),
	status: Yup.string().default(''),
	timestamp: Yup.mixed().default(''),
});

const dataSchema = Yup.object({
	script: Yup.string().default(''),
	title: Yup.string().default('Zombie Processing Statuses'),
	domain: Yup.string().default(() => config.getBaseURL()),
	message: Yup.string().default('Zombie processing statuses found'),
	zombieEntries: Yup.object({
		models: Yup.array().of(zombieEntrySchema).default([]),
		drawings: Yup.array().of(zombieEntrySchema).default([]),
		clashRuns: Yup.array().of(zombieEntrySchema).default([]),
	}).default({ models: [], drawings: [], clashRuns: [] }),
}).required(true);

const ZombieProcessingStatusesTemplate = {};
ZombieProcessingStatusesTemplate.subject = (data) => {
	const { domain, title, script } = dataSchema.cast(data);
	return `[${domain}][${script}] ${title}`;
};

ZombieProcessingStatusesTemplate.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = ZombieProcessingStatusesTemplate;
