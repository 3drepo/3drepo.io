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
import { trimmedString } from '@/v5/validation/shared/validators';
import { isEmpty, isUndefined } from 'lodash';
import * as Yup from 'yup';
import { PropertyDefinition } from './tickets.types';

export const modelIsFederation = (modelId: string) => (
	!!FederationsHooksSelectors.selectContainersByFederationId(modelId).length
);

const MAX_TEXT_LENGTH = 50;
const MAX_LONG_TEXT_LENGTH = 120;
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
			validator = Yup.array();
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
			validator = Yup.number().nullable(true).transform((_, val) => Number(val) || null);
			break;
		case 'date':
			validator = Yup.date().nullable();
			break;
		default: validator = trimmedString;
	}

	if (required) {
		if (type === 'manyOf') {
			validator = validator.min(1,
				formatMessage({
					id: 'validation.ticket.manyOf.required',
					defaultMessage: 'Select at least one option',
				}));
		}
		if (type === 'coords') {
			const requiredCoord = Yup.string().required(
				formatMessage({
					id: 'validation.ticket.coord.required',
					defaultMessage: 'This is required',
				}),
			);
			validator = Yup.array(requiredCoord);
		}
		validator = validator.required(
			formatMessage({
				id: 'validation.ticket.requiredField',
				defaultMessage: '{name} is a required field',
			},
			{ name }),
		);
	}

	return validator;
};

export const propertiesValidator = (properties) => {
	const validators = properties.reduce(
		(validatorsObj, property) => ({
			...validatorsObj,
			[property.name]: propertyValidator(property),
		}),
		{},
	);
	return Yup.object().shape(validators);
};

const parseModule = (module) => {
	const parsedModule = {};
	Object.entries(module)
		// skip nullish values that are not 0s or false
		.filter((entry) => ![null, undefined, ''].includes(entry[1] as any))
		.forEach(([key, value]) => {
			if (Array.isArray(value)) {
				if (value.length === 0) return;
				// manyOf should not allow empty or nullish values, but coords may.
				// If those values are all undefined, the property (coords) shall be filtered.
				// Otherwise, its elements should be transformed into `0`s
				if (value.length === 3 && !value.some((v) => !isUndefined(v))) return;
				parsedModule[key] = value.map((v) => v || 0);
			} else {
				parsedModule[key] = value;
			}
		});
	return parsedModule;
};

export const filterEmptyValues = (ticket) => {
	const parsedTicket = {};
	Object.entries(ticket).forEach(([key, value]) => {
		switch (key) {
			case 'properties':
				parsedTicket[key] = parseModule(value);
				break;
			case 'modules':
				parsedTicket[key] = {};
				Object.entries(value).forEach(([module, moduleValue]) => {
					const parsedModule = parseModule(moduleValue);
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
