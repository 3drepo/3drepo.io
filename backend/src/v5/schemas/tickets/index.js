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
const { fieldTypes } = require('./templates.constants');
const { fieldTypesToValidator } = require('./validators');
const { generateFullSchema } = require('./templates');
const { logger } = require('../../utils/logger');
const { types } = require('../../utils/helper/yup');

const Tickets = {};

const generatePropertiesValidator = (properties) => {
	const obj = {};

	properties.forEach((prop) => {
		if (prop.deprecated || prop.readOnly) return;
		let validator = fieldTypesToValidator[prop.type];
		if (validator) {
			// FIXME: Deal with predefined list
			if (prop.type === fieldTypes.ONE_OF) {
				validator = validator.oneOf(prop.values);
			} else if (prop.type === fieldTypes.MANY_OF) {
				validator = Yup.array().of(types.strings.title.oneOf(prop.values));
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

	return Yup.object(obj).required();
};

const generateModulesValidator = (modules) => {
	const moduleToSchema = {};

	modules.forEach((module) => {
		if (!module.deprecated) {
			const id = module.name || module.type;
			moduleToSchema[id] = Yup.object({
				properties: generatePropertiesValidator(module.properties),
			}).required();
		}
	});

	return Yup.object(moduleToSchema).required();
};

const generateTicketValidator = (template) => {
	const fullTem = generateFullSchema(template);
	const validator = Yup.object().shape({
		properties: generatePropertiesValidator(fullTem.properties),
		modules: generateModulesValidator(template.modules),
	});
	return Promise.resolve(validator); // FIXME
};

Tickets.validateTicket = async (template, data) => {
	const validator = await generateTicketValidator(template);
	return validator.validate(data, { stripUnknown: true });
};
module.exports = Tickets;
