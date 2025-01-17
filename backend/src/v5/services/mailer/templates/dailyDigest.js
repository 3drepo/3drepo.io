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
const { readFileSync } = require('fs');

const ticketObjectSchema = Yup.object({
	count: Yup.number().min(1).required(),
	link: Yup.string().required(),
}).default(undefined);

const dataSchema = Yup.object({
	username: Yup.string().required(),
	teamspace: Yup.string().required(),
	domain: Yup.string().default(() => config.getBaseURL()),
	notifications: Yup.array().of(Yup.object({
		project: Yup.string().required(),
		model: Yup.string().required(),
		tickets: Yup.object({
			updated: ticketObjectSchema,
			assigned: ticketObjectSchema,
			closed: ticketObjectSchema,
		}).required(),

	})).min(1).required(),
}).required(true);

const TEMPLATE_PATH = `${__dirname}/html/dailyDigest.html`;

const DailyDigestTemplate = {};

DailyDigestTemplate.subject = ({ teamspace }) => `[${teamspace}] Activities you have missed`;

DailyDigestTemplate.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

DailyDigestTemplate.styles = readFileSync(`${__dirname}/html/dailyDigest.styles`, 'utf8');

module.exports = DailyDigestTemplate;
