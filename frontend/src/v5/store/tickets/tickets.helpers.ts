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
import { PropertyDefinition } from './tickets.types';
import * as Yup from 'yup';

export const modelIsFederation = (modelId: string) => (
	!!FederationsHooksSelectors.selectContainersByFederationId(modelId).length
);

export const propertiesValidator = (properties) => {
	const validators = properties.reduce(
		(validators, property) => ({
			...validators,
			[property.name]: propertyValidator(property),
		}),
		{},
	);
	return Yup.object().shape(validators);
};

export const propertyValidator = ({ required, name, type }: PropertyDefinition) => {
	let validator = trimmedString;

	if (required) {
		validator = validator.required(
			formatMessage({
				id: 'validation.ticket.requiredField',
				defaultMessage: '{name} is a required field',
			},
			{ name }),
		);
	}

	if (type === 'text') {
		const maxLength = 50;

		validator = validator.max(maxLength,
			formatMessage({
				id: 'validation.ticket.tooLong',
				defaultMessage: 'Max length of text is {maxLength}',
			},
			{ maxLength }));
	}

	return validator;
};