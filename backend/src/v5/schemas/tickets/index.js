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

const {
	basePropertyLabels,
	modulePropertyLabels,
	presetEnumValues,
	presetModules,
	propTypes,
	riskLevels,
	riskLevelsToNum } = require('./templates.constants');
const Yup = require('yup');
const { generateFullSchema } = require('./templates');
const { getAllUsersInTeamspace } = require('../../models/teamspaces');
const { getJobs } = require('../../models/jobs');
const { getRiskCategories } = require('../../models/teamspaces');
const { logger } = require('../../utils/logger');
const { propTypesToValidator } = require('./validators');
const { types } = require('../../utils/helper/yup');

const Tickets = {};

const generatePropertiesValidator = async (teamspace, properties, isNewTicket) => {
	const obj = {};

	const proms = properties.map(async (prop) => {
		if (prop.deprecated || prop.readOnly) return;
		let validator = propTypesToValidator[prop.type];
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
				case presetEnumValues.RISK_CATEGORIES:
					values = await getRiskCategories(teamspace);
					break;
				default:
					values = prop.values;
				}

				if (prop.type === propTypes.ONE_OF) {
					validator = validator.oneOf(values);
				} else if (prop.type === propTypes.MANY_OF) {
					validator = Yup.array().of(types.strings.title.oneOf(values));
				} else {
					logger.logError(`Property values found for a non selection type (${prop.type})`);
				}
			}

			if (prop.required) {
				validator = validator.required();
			} else if (!isNewTicket) {
				validator = validator.nullable();
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

	return Yup.object(obj).default({});
};

const generateModuleValidator = async (teamspace, modules, isNewTicket) => {
	const moduleToSchema = {};
	const proms = modules.map(async (module) => {
		if (!module.deprecated) {
			const id = module.name || module.type;
			moduleToSchema[id] = await generatePropertiesValidator(teamspace, module.properties, isNewTicket);
		}
	});

	await Promise.all(proms);

	return moduleToSchema;
};

Tickets.validateTicket = async (teamspace, template, data, isNewTicket) => {
	const fullTem = generateFullSchema(template);

	const moduleSchema = await generateModuleValidator(teamspace, fullTem.modules, isNewTicket);

	const validator = Yup.object().shape({
		...(isNewTicket ? { title: types.strings.title.required() } : { title: types.strings.title }),
		properties: await generatePropertiesValidator(teamspace, fullTem.properties, isNewTicket),
		modules: Yup.object(moduleSchema).default({}),
		...(isNewTicket ? { type: Yup.mixed().required() } : {}),
	});

	return validator.validate(data, { stripUnknown: true });
};

const calculateLevelOfRisk = (likelihood, consequence) => {
	let levelOfRisk;

	const data1 = riskLevelsToNum(likelihood);
	const data2 = riskLevelsToNum(consequence);

	if (data1 >= 0 && data2 >= 0) {
		const score = data1 + data2;

		if (score > 6) {
			levelOfRisk = riskLevels.VERY_HIGH;
		} else if (score > 5) {
			levelOfRisk = riskLevels.HIGH;
		} else if (score > 2) {
			levelOfRisk = riskLevels.MODERATE;
		} else if (score > 1) {
			levelOfRisk = riskLevels.LOW;
		} else {
			levelOfRisk = riskLevels.VERY_LOW;
		}
	}

	return levelOfRisk;
};

Tickets.processReadOnlyValues = (ticket, user, isNewTicket) => {
	const { properties, modules } = ticket;
	const currTime = new Date();

	if (isNewTicket) {
		properties[basePropertyLabels.OWNER] = properties[basePropertyLabels.OWNER] ?? user;
		properties[basePropertyLabels.CREATED_AT] = properties[basePropertyLabels.CREATED_AT] ?? currTime;
	}

	properties[basePropertyLabels.UPDATED_AT] = properties[basePropertyLabels.UPDATED_AT] ?? currTime;

	if (modules[presetModules.SAFETIBASE]) {
		const safetiBaseProps = modules[presetModules.SAFETIBASE];
		const modProps = modulePropertyLabels[presetModules.SAFETIBASE];

		safetiBaseProps[modProps.LEVEL_OF_RISK] = calculateLevelOfRisk(
			safetiBaseProps[modProps.RISK_LIKELIHOOD],
			safetiBaseProps[modProps.RISK_CONSEQUENCE],
		);

		const treatedLevel = calculateLevelOfRisk(
			safetiBaseProps[modProps.TREATED_RISK_LIKELIHOOD],
			safetiBaseProps[modProps.TREATED_RISK_CONSEQUENCE],
		);

		if (treatedLevel) {
			safetiBaseProps[modProps.TREATED_LEVEL_OF_RISK] = treatedLevel;
		}
	}
};
module.exports = Tickets;
