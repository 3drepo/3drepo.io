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

const errorNotification = require('./templates/errorNotification');
const forgotPassword = require('./templates/forgotPassword');
const forgotPasswordSso = require('./templates/forgotPasswordSSO');
const modelImportError = require('./templates/modelImportError');
const { toConstantCase } = require('../../utils/helper/strings');
const verifyUser = require('./templates/verifyUser');

const MailerConstants = {};

const templates = {
	verifyUser,
	forgotPassword,
	forgotPasswordSso,
	errorNotification,
	modelImportError,
};

MailerConstants.templates = {};
Object.keys(templates).forEach((templateName) => {
	const name = toConstantCase(templateName);
	MailerConstants.templates[name] = { ...templates[templateName], name };
});

module.exports = MailerConstants;
