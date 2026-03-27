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
const { generateTemplateFn } = require('./common');

const dataSchema = Yup.object({
	teamspacesToExpire: Yup.array().of(Yup.object({
		teamspace: Yup.string().required(),
		expiryDate: Yup.date().required(),
	})).min(1).required(),
}).required(true);

const TEMPLATE_PATH = `${__dirname}/html/internalTeamspaceExpiryList.html`;

const InternalTeamspaceExpiryListTemplate = {};

InternalTeamspaceExpiryListTemplate.subject = () => 'Teamspaces with upcoming expiry';

InternalTeamspaceExpiryListTemplate.html = generateTemplateFn(dataSchema, TEMPLATE_PATH);

module.exports = InternalTeamspaceExpiryListTemplate;
