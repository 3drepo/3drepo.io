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

const { UUIDToString, stringToUUID } = require('../../utils/helper/uuids');
const {
	basePropertyLabels,
	modulePropertyLabels,
	presetEnumValues,
	presetModules,
	propTypes,
	riskLevels,
	riskLevelsToNum,
	viewGroups,
} = require('./templates.constants');
const { deleteIfUndefined, isEqual } = require('../../utils/helper/objects');
const { getAllUsersInTeamspace, getRiskCategories } = require('../../models/teamspaceSettings');
const { isDate, isObject, isUUIDString } = require('../../utils/helper/typeCheck');
const { types, utils: { stripWhen } } = require('../../utils/helper/yup');
const Yup = require('yup');
const { deserialiseGroupSchema } = require('./tickets.groups');
const { generateFullSchema } = require('./templates');
const { getArrayDifference } = require('../../utils/helper/arrays');
const { getJobNames } = require('../../models/jobs');
const { getTicketsByQuery } = require('../../models/tickets');
const { importCommentSchema } = require('./tickets.comments');
const { logger } = require('../../utils/logger');
const { propTypesToValidator } = require('./validators');

const Tickets = {};

const generatePropertiesValidator = async (teamspace, project, model, templateId, moduleName,
	properties, oldProperties, isNewTicket) => {
	const obj = {};

	const proms = properties.map(async (prop) => {
		if (prop.deprecated || prop.readOnly) return;
		let validator = propTypesToValidator(prop.type, !isNewTicket, prop.required);
		if (validator) {
			if (prop.values) {
				let values;
				switch (prop.values) {
				case presetEnumValues.JOBS_AND_USERS:
					{
						const [jobs, users] = await Promise.all([
							getJobNames(teamspace),
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
					validator = validator.oneOf(isNewTicket || prop.required ? values : values.concat(null));
				} else if (prop.type === propTypes.MANY_OF) {
					validator = Yup.array().of(types.strings.title.oneOf(values));
				} else {
					logger.logError(`Property values found for a non selection type (${prop.type})`);
				}
			}

			if (prop.unique) {
				validator = validator.test('Unique property', `The value of unique property ${prop.name} is already used in another ticket`,
					async (value) => {
						if (value !== undefined && value !== null) {
							const query = { type: templateId, [`${moduleName ? `modules.${moduleName}` : 'properties'}.${prop.name}`]: value };
							const duplicateTickets = await getTicketsByQuery(teamspace, project,
								model, query, { _id: 1 });
							return !duplicateTickets.length;
						}

						return true;
					});
			}

			if (isNewTicket) {
				if (prop.default) {
					validator = validator.default(prop.default);
				}
				if (prop.required) {
					validator = validator.required();
				}
			} else {
				if (!prop.required) {
					// We still need this line because ONE_OF and MANY_OF rewrites the validator.
					validator = validator.nullable();
				}

				const oldValue = oldProperties?.[prop.name];

				if (prop.immutable && oldValue !== undefined) {
					validator = validator.test('Immutable property', `Immutable property ${prop.name} cannot be edited`, (value) => value === undefined);
				}

				if (prop.type === propTypes.IMAGE_LIST) {
					validator = validator.test('Invalid image refs', `Property ${prop.name} contains refs that do not correspond to an existing image`,
						(value, { originalValue }) => {
							const newRefs = originalValue?.filter(isUUIDString) ?? [];

							if (!newRefs.length) {
								return true;
							}

							const existingRefs = (oldValue ?? []).map(UUIDToString);
							return getArrayDifference(existingRefs, newRefs).length === 0;
						});
				}

				validator = stripWhen(validator, (p) => {
					let valueToEval = p;
					if (isObject(p) && !isDate(p)) {
						// composite types - merge the old value with new
						valueToEval = deleteIfUndefined({ ...oldValue, ...p }, true);

						// if the object becomes empty, we're effectively setting it to null
						valueToEval = isEqual(valueToEval, {}) ? null : valueToEval;
					}
					return (valueToEval === null && oldValue === undefined && !prop.required)
						|| isEqual(valueToEval, oldValue);
				});
			}

			obj[prop.name] = validator;
		} else {
			logger.logError(`Unrecognised custom ticket property type: ${prop.type}`);
		}
	});

	await Promise.all(proms);

	return Yup.object(obj).default({});
};

const generateModuleValidator = async (teamspace, project, model, templateId, modules, oldModules,
	isNewTicket, cleanUpPass) => {
	const moduleToSchema = {};
	const proms = modules.map(async (module) => {
		if (!module.deprecated) {
			const id = module.name || module.type;
			const modValidator = await generatePropertiesValidator(teamspace, project, model, templateId, id,
				module.properties, oldModules?.[id], isNewTicket);
			moduleToSchema[id] = cleanUpPass
				? stripWhen(modValidator, (val) => isEqual(val, {}) || !val) : modValidator;
		}
	});

	await Promise.all(proms);

	return moduleToSchema;
};

Tickets.validateTicket = async (teamspace, project, model, template, newTicket, oldTicket, isImport) => {
	const isNewTicket = !oldTicket;
	const fullTem = generateFullSchema(template, isNewTicket && isImport);

	const validatorObj = {
		title: isNewTicket ? types.strings.title.required()
			: stripWhen(types.strings.title, (t) => isEqual(t, oldTicket?.title)),
		properties: await generatePropertiesValidator(teamspace, project, model, template._id,
			undefined, fullTem.properties, oldTicket?.properties, isNewTicket),
		modules: Yup.object(
			await generateModuleValidator(teamspace, project, model, template._id,
				fullTem.modules, oldTicket?.modules, isNewTicket),
		).default({}),
		type: Yup.mixed().strip(),
	};

	if (isImport) {
		if (template.config.comments) validatorObj.comments = Yup.array().min(1).of(importCommentSchema);
		else if (newTicket.comments) {
			throw new Error('Comments are not supported for this template type.');
		}
	}

	const validatedTicket = await Yup.object(validatorObj).validate(newTicket, { stripUnknown: true });

	// Run it again so we can check for unchanged properties that looked changed due to default values
	validatorObj.modules = Yup.object(await generateModuleValidator(teamspace, project, model,
		template._id, fullTem.modules, oldTicket?.modules, isNewTicket, true),
	).default({});

	const retVal = await Yup.object(validatorObj).validate(validatedTicket, { stripUnknown: true });

	if (isNewTicket) {
		retVal.type = template._id;
	}

	return retVal;
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

Tickets.processReadOnlyValues = (oldTicket, newTicket, user) => {
	const { properties, modules } = newTicket;
	const currTime = new Date();

	if (!oldTicket) {
		properties[basePropertyLabels.OWNER] = properties[basePropertyLabels.OWNER] ?? user;
		properties[basePropertyLabels.CREATED_AT] = properties[basePropertyLabels.CREATED_AT] ?? currTime;
	}

	properties[basePropertyLabels.UPDATED_AT] = currTime;

	const newSafetibaseProps = modules?.[presetModules.SAFETIBASE];
	const oldSafetibaseProps = oldTicket?.modules?.[presetModules.SAFETIBASE] || {};

	if (newSafetibaseProps) {
		const modProps = modulePropertyLabels[presetModules.SAFETIBASE];

		if (newSafetibaseProps[modProps.RISK_LIKELIHOOD] || newSafetibaseProps[modProps.RISK_CONSEQUENCE]) {
			newSafetibaseProps[modProps.LEVEL_OF_RISK] = calculateLevelOfRisk(
				newSafetibaseProps[modProps.RISK_LIKELIHOOD] ?? oldSafetibaseProps[modProps.RISK_LIKELIHOOD],
				newSafetibaseProps[modProps.RISK_CONSEQUENCE] ?? oldSafetibaseProps[modProps.RISK_CONSEQUENCE],
			);
		}

		if (newSafetibaseProps[modProps.TREATED_RISK_LIKELIHOOD]
			|| newSafetibaseProps[modProps.TREATED_RISK_CONSEQUENCE]) {
			const treatedLevel = calculateLevelOfRisk(
				newSafetibaseProps[modProps.TREATED_RISK_LIKELIHOOD]
				?? oldSafetibaseProps[modProps.TREATED_RISK_LIKELIHOOD],
				newSafetibaseProps[modProps.TREATED_RISK_CONSEQUENCE]
				?? oldSafetibaseProps[modProps.TREATED_RISK_CONSEQUENCE],
			);
			if (treatedLevel) {
				newSafetibaseProps[modProps.TREATED_LEVEL_OF_RISK] = treatedLevel;
			}
		}
	}
};

const uuidString = Yup.string().transform((val, orgVal) => UUIDToString(orgVal)).nullable();

const generateCastObject = ({ properties, modules }, stripDeprecated) => {
	const groupCast = Yup.array().of(Yup.object({
		group: uuidString,
	}));
	const castProps = (props) => {
		const res = {};
		props.forEach(({ type, name, deprecated }) => {
			if (stripDeprecated && deprecated) {
				res[name] = Yup.mixed().strip();
			} else if (type === propTypes.DATE || type === propTypes.PAST_DATE) {
				res[name] = Yup.number().transform((_, val) => (val === null ? val : val?.getTime())).nullable();
			} else if (type === propTypes.VIEW) {
				res[name] = Yup.object({
					screenshot: uuidString,
					state: Yup.object({
						[viewGroups.COLORED]: groupCast,
						[viewGroups.HIDDEN]: groupCast,
						[viewGroups.TRANSFORMED]: groupCast,
					}).default(undefined),
				}).nullable().default(undefined);
			} else if (type === propTypes.IMAGE) {
				res[name] = uuidString;
			} else if (type === propTypes.IMAGE_LIST) {
				res[name] = Yup.array().of(uuidString);
			}
		});

		return Yup.object(res).default(undefined);
	};

	const modulesCaster = {};

	modules.forEach(({ name, type, deprecated, properties: modProps }) => {
		const id = name ?? type;
		if (stripDeprecated && deprecated) {
			modulesCaster[id] = Yup.mixed().strip();
		} else {
			modulesCaster[id] = castProps(modProps);
		}
	});

	return Yup.object({
		_id: uuidString,
		type: uuidString,
		properties: castProps(properties),
		modules: Yup.object(modulesCaster).default(undefined),
	});
};
const genToUUIDSchema = ({ properties, modules }) => {
	const uuidObj = Yup.mixed().transform(stringToUUID);
	const groupCast = Yup.lazy((val) => (isUUIDString(val) ? uuidObj
		: deserialiseGroupSchema));
	const groupStateArrays = Yup.array().of(Yup.object({
		group: groupCast,
	}));
	const castProps = (props) => {
		const res = {};
		props.forEach(({ type, name }) => {
			if (type === propTypes.VIEW) {
				res[name] = Yup.object({
					state: Yup.object({
						[viewGroups.COLORED]: groupStateArrays,
						[viewGroups.HIDDEN]: groupStateArrays,
						[viewGroups.TRANSFORMED]: groupStateArrays,
					}).default(undefined).nullable(),
				}).nullable().default(undefined);
			}
		});

		return Yup.object(res).default(undefined);
	};

	const modulesCaster = {};

	modules.forEach(({ name, type, properties: modProps }) => {
		const id = name ?? type;
		modulesCaster[id] = castProps(modProps);
	});

	return Yup.object({
		properties: castProps(properties),
		modules: Yup.object(modulesCaster).default(undefined),
	});
};

Tickets.deserialiseUUIDsInTicket = (ticket, template) => {
	const fullTem = generateFullSchema(template);
	const caster = genToUUIDSchema(fullTem);
	return caster.cast(ticket);
};

// NOTE: this function assumes the full template is being passed in - i.e. generateFullSchema has been called.
Tickets.serialiseTicket = (ticket, fullTemplate, stripDeprecated) => {
	const caster = generateCastObject({
		...fullTemplate,
	}, stripDeprecated);
	return caster.cast(ticket);
};

module.exports = Tickets;
