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

import { formatMessage } from '@/v5/services/intl';
import { FederationsHooksSelectors } from '@/v5/services/selectorsHooks/federationsSelectors.hooks';
import { nullableNumber, requiredNumber, trimmedString } from '@/v5/validation/shared/validators';
import { isEmpty } from 'lodash';
import * as Yup from 'yup';
import WarningIcon from '@assets/icons/stepper_error.svg';
import PropetiesIcon from '@assets/icons/outlined/properties-outlined.svg';
import { EditableTicket, ITemplate, PropertyDefinition } from './tickets.types';

export const TITLE_INPUT_NAME = 'title';

export const modelIsFederation = (modelId: string) => (
	!!FederationsHooksSelectors.selectContainersByFederationId(modelId).length
);

export const getEditableProperties = (template) => {
	const propertyIsEditable = ({ readOnly }) => !readOnly;

	return {
		properties: (template.properties || []).filter(propertyIsEditable),
		modules: (template.modules || []).map((module) => ({
			...module,
			properties: module.properties.filter(propertyIsEditable),
		})),
	};
};

const templatePropertiesToTicketProperties = (properties = []) => (
	properties.reduce(
		(ticketProperties, prop) => ({
			...ticketProperties,
			[prop.name]: prop.default,
		}),
		{},
	)
);

export const getDefaultTicket = (template: ITemplate): EditableTicket => {
	const properties = templatePropertiesToTicketProperties(template.properties);
	const modules = (template.modules || []).reduce(
		(ticketModules, { name, type, properties: moduleProperties }) => ({
			...ticketModules,
			[name || type]: templatePropertiesToTicketProperties(moduleProperties),
		}),
		{},
	);
	return ({
		title: '',
		type: template._id,
		// props at root level other than title and type are skipped as they are not required
		properties,
		modules,
	});
};

const MAX_TEXT_LENGTH = 120;
const MAX_LONG_TEXT_LENGTH = 1200;
const maxStringLength = (type) => (type === 'longText' ? MAX_LONG_TEXT_LENGTH : MAX_TEXT_LENGTH);

export const propertyValidator = ({ required, name, type }: PropertyDefinition) => {
	let validator;
	const maxLength = maxStringLength(type);

	switch (type) {
		case 'text':
		case 'longText':
			validator = trimmedString.max(maxLength,
				formatMessage({
					id: 'validation.ticket.tooLong',
					defaultMessage: ' {name} is limited to {maxLength} characters',
				},
				{ maxLength, name }));
			break;
		case 'coords':
			validator = Yup.array().nullable();
			break;
		case 'manyOf':
			validator = Yup.array();
			break;
		case 'oneOf':
			validator = trimmedString;
			break;
		case 'boolean':
			validator = Yup.boolean();
			break;
		case 'number':
			validator = nullableNumber;
			break;
		case 'date':
			validator = Yup.date().nullable();
			break;
		default:
			validator = trimmedString;
	}

	if (required) {
		validator = validator.required(
			formatMessage({
				id: 'validation.ticket.requiredField',
				defaultMessage: '{name} is a required field',
			},
			{ name }),
		);
		if (type === 'manyOf') {
			validator = validator.min(1,
				formatMessage({
					id: 'validation.ticket.manyOf.required',
					defaultMessage: 'Select at least one option',
				}));
		}

		if (type === 'number') {
			validator = requiredNumber(
				formatMessage({
					id: 'validation.ticket.requiredField',
					defaultMessage: '{name} is a required field',
				},
				{ name }),
			);
		}
	}

	return validator;
};

export const propertiesValidator = (properties = []) => {
	const validators = properties.reduce(
		(validatorsObj, property) => ({
			...validatorsObj,
			[property.name || property.title]: propertyValidator(property),
		}),
		{},
	);
	return Yup.object().shape(validators);
};

export const getTicketValidator = (template) => {
	const validators: any = {
		title: propertyValidator({
			required: true,
			type: 'text',
			name: TITLE_INPUT_NAME,
		}),
	};
	const editableTemplate = getEditableProperties(template);
	validators.properties = propertiesValidator(editableTemplate.properties);

	const modulesValidators = {};
	editableTemplate.modules.forEach(({ name, type, properties }) => {
		modulesValidators[name || type] = propertiesValidator(properties);
	});

	validators.modules = Yup.object().shape(modulesValidators);

	return Yup.object().shape(validators);
};

const filterEmptyModuleValues = (module) => {
	const parsedModule = {};
	const NULLISH_VALUES = [null, undefined, ''];
	Object.entries(module)
		// skip nullish values that are not 0s or false
		.filter((entry) => !NULLISH_VALUES.includes(entry[1] as any))
		.forEach(([key, value]) => {
			if (Array.isArray(value)) {
				if (value.length === 0) return;
				// If value is an empty coords property ([undefined x 3]), it shall be removed
				if (value.length === 3 && !value.some((v) => !NULLISH_VALUES.includes(v))) return;
				// A this point, we are either dealing with a coords property that has
				// at least 1 value that is not undefined, or with a manyOf property.
				// Since the manyOf (array of) values should not hold falsy values,
				// we map all those values to 0s. So, if the property was indeed
				// a manyOf, nothing happens, but if the property was a coords,
				// we map all the non-numeric values to 0.
				parsedModule[key] = value.map((v) => v || 0);
			} else {
				parsedModule[key] = value;
			}
		});
	return parsedModule;
};

export const filterEmptyTicketValues = (ticket) => {
	const parsedTicket = {};
	Object.entries(ticket).forEach(([key, value]) => {
		switch (key) {
			case 'properties':
				parsedTicket[key] = filterEmptyModuleValues(value);
				break;
			case 'modules':
				parsedTicket[key] = {};
				Object.entries(value).forEach(([module, moduleValue]) => {
					const parsedModule = filterEmptyModuleValues(moduleValue);
					if (!isEmpty(parsedModule)) {
						parsedTicket[key][module] = parsedModule;
					}
				});
				break;
			default:
				parsedTicket[key] = value;
		}
	});
	return parsedTicket;
};

export const getValidators = (template) => {
	const { properties, modules } = template;
	const validators: any = {
		title: propertyValidator({
			required: true,
			type: 'longText',
			name: TITLE_INPUT_NAME,
		}),
	};

	validators.properties = propertiesValidator(properties || []);

	if (modules) {
		const modulesValidator = {};
		modules.forEach((module) => {
			modulesValidator[module.name || module.type] = propertiesValidator(module.properties);
		});

		validators.modules = Yup.object().shape(modulesValidator);
	}

	return Yup.object().shape(validators);
};

const moduleTypeProperties = {
	safetibase: { title: formatMessage({ id: 'customTicket.panel.safetibase', defaultMessage: 'Safetibase' }), Icon: WarningIcon },
	sequencing: { title: formatMessage({ id: 'customTicket.panel.sequencing', defaultMessage: 'Sequencing' }) },
	shapes: { title: formatMessage({ id: 'customTicket.panel.shapes', defaultMessage: 'Shapes' }) },
};

export const getModulePanelTitle = (module) => {
	if (module.name) return { title: module.name, Icon: PropetiesIcon };
	return { Icon: PropetiesIcon, ...moduleTypeProperties[module.type] };
};
