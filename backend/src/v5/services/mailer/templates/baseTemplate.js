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

const TEMPLATE_PATH = `${__dirname}/html/baseTemplate.html`;

const dataSchema = Yup.object({
	domain: Yup.string().default(() => config.getBaseURL()),
	firstName: Yup.string().required(),
	emailContent: Yup.string().required(),
	extraStyles: Yup.string().default(''),
}).required(true);

const BaseTemplate = {};

BaseTemplate.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = BaseTemplate;
