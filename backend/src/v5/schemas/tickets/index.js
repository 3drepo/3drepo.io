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

const { fieldTypes, presetEnumValues } = require('./templates.constants');
const Yup = require('yup');
const { fieldTypesToValidator } = require('./validators');
const { generateFullSchema } = require('./templates');
const { getAllUsersInTeamspace } = require('../../models/teamspaces');
const { getJobs } = require('../../models/jobs');
const { logger } = require('../../utils/logger');
const { types } = require('../../utils/helper/yup');

const Tickets = {};

const generatePropertiesValidator = async (teamspace, properties) => {
	const obj = {};

	const proms = properties.map(async (prop) => {
		if (prop.deprecated || prop.readOnly) return;
		let validator = fieldTypesToValidator[prop.type];
		if (validator) {
			if (prop.values) {
				let values;
				switch (prop.values) {
				case presetEnumValues.JOBS_AND_USERS:
					{
						const [jobs, users] = await Promise.all([
							getJobs(teamspace),
							getAllUsersInTeamspace(teamspace),
						]);

						values = [...jobs, ...users];
					}
					break;
				default:
					values = prop.values;
				}

				if (prop.type === fieldTypes.ONE_OF) {
					validator = validator.oneOf(values);
				} else if (prop.type === fieldTypes.MANY_OF) {
					validator = Yup.array().of(types.strings.title.oneOf(values));
				} else {
					logger.logError(`Property values found for a non selection type (${prop.type})`);
				}
			}

			if (prop.required) {
				validator = validator.required();
			}

			if (prop.default) {
				validator = validator.default(prop.default);
			}

			obj[prop.name] = validator;
		} else {
			logger.logError(`Unrecognised custom ticket property type: ${prop.type}`);
		}
	});

	await Promise.all(proms);

	return Yup.object(obj).required();
};

const generateModuleValidator = async (teamspace, modules) => {
	const moduleToSchema = {};
	const proms = modules.map(async (module) => {
		if (!module.deprecated) {
			const id = module.name || module.type;
			moduleToSchema[id] = Yup.object({
				properties: await generatePropertiesValidator(teamspace, module.properties),
			}).required();
		}
	});

	await Promise.all(proms);

	return moduleToSchema;
};

Tickets.validateTicket = async (teamspace, template, data) => {
	const fullTem = generateFullSchema(template);

	const moduleSchema = await generateModuleValidator(teamspace, fullTem.modules);

	const validator = Yup.object().shape({
		properties: await generatePropertiesValidator(teamspace, fullTem.properties),
		modules: Yup.object(moduleSchema),
	});
	return validator.validate(data, { stripUnknown: true });
};
module.exports = Tickets;
