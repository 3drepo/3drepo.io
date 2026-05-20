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
import { BaseProperties } from '@/v5/ui/routes/viewer/tickets/tickets.constants';
import { nullableNumber, requiredNumber, trimmedString } from '@/v5/validation/shared/validators';
import * as Yup from 'yup';
import { isEmpty } from 'lodash';
import { getEditableProperties } from './tickets.helpers';
import { ITemplate, PropertyDefinition, Viewpoint } from './tickets.types';

export const MAX_TEXT_LENGTH = 120;
export const MAX_LONG_TEXT_LENGTH = 1200;
const maxStringLength = (type) => (type === 'longText' ? MAX_LONG_TEXT_LENGTH : MAX_TEXT_LENGTH);

const propertyValidator = ({ required, name, type }: PropertyDefinition) => {
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
		case 'image':
			validator = Yup.string().nullable();
			break;
		case 'imageList':
			validator = Yup.array().nullable();
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
			validator = nullableNumber;
			break;
		default:
			validator = Yup.object().nullable();
	}

	if (required && type !== 'boolean') {
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
		if (type === 'view') {
			validator = Yup.object().nullable().test({
				test: (view: Viewpoint) => view?.camera && !isEmpty(view.camera),
				message: formatMessage({
					id: 'validation.ticket.requiredField',
					defaultMessage: '{name} is a required field',
				},
				{ name }),
			});
		}
	}

	return validator;
};

const propertiesValidator = (properties = []) => {
	const validators = properties.reduce(
		(validatorsObj, property) => ({
			...validatorsObj,
			[property.name || property.title]: propertyValidator(property),
		}),
		{},
	);
	return Yup.object().shape(validators);
};

const getTitleValidator = () => propertyValidator({
	required: true,
	type: 'text',
	name: BaseProperties.TITLE,
});

export const getTicketValidator = (template) => {
	const validators: any = { title: getTitleValidator() };
	const editableTemplate = getEditableProperties(template);
	validators.properties = propertiesValidator(editableTemplate.properties);

	const modulesValidators = {};
	editableTemplate.modules.forEach(({ name, type, properties }) => {
		modulesValidators[name || type] = propertiesValidator(properties);
	});

	validators.modules = Yup.object().shape(modulesValidators);

	return Yup.object().shape(validators);
};

export const getValidators = (template: ITemplate) => {
	if (!template) return null;
	const { properties, modules } = template;
	const validators: any = { title: getTitleValidator() };

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
