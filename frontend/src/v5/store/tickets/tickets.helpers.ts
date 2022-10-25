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
import * as Yup from 'yup';
import { PropertyDefinition } from './tickets.types';

export const modelIsFederation = (modelId: string) => (
	!!FederationsHooksSelectors.selectContainersByFederationId(modelId).length
);

export const propertyValidator = ({ required, name, type }: PropertyDefinition) => {
	let validator;
	const MAX_STRING_LENGTH = 50;

	switch (type) {
		case 'text' || 'longText' || 'oneOf' || 'manyOf':
			validator = trimmedString.max(MAX_STRING_LENGTH,
				formatMessage({
					id: 'validation.ticket.tooLong',
					defaultMessage: 'Max length of text is {MAX_STRING_LENGTH}',
				},
				{ MAX_STRING_LENGTH }));
			break;
		case 'coords':
			validator = Yup.array();
			break;
		case 'boolean':
			validator = Yup.boolean();
			break;
		case 'number':
			validator = Yup.number();
			break;
		case 'date':
			validator = Yup.date();
			break;
		default: validator = trimmedString;
	}

	if (required) {
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
