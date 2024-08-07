/**
 *  Copyright (C) 2023 3D Repo Ltd
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

import * as Yup from 'yup';
import { formatMessage } from '@/v5/services/intl';
import { isEqual } from 'lodash';
import { OPERATIONS_TYPES } from '@/v5/store/tickets/tickets.types';
import { nullableString } from '../shared/validators';

const requiredTrimmedString = Yup.string().trim().required(
	formatMessage({
		id: 'validation.ticket.groupFilters.error.required',
		defaultMessage: 'This is a required field',
	}),
);

const valueType = Yup.object({ value: requiredTrimmedString });

export const GroupRuleSchema = Yup.object().shape({
	name: requiredTrimmedString.test(
		'alreadyExistingName',
		formatMessage({
			id: 'validation.ticket.groupFilters.error.alreadyExistingName',
			defaultMessage: 'This name already exists',
		}),
		(name, testContext) => (
			!testContext.options.context?.alreadyExistingNames.map((n) => n.trim().toLocaleLowerCase()).includes(name.toLocaleLowerCase())
		),
	),
	field: Yup.object().shape({
		operator: requiredTrimmedString,
		values: Yup.array().of(valueType),
	}),
	operator: requiredTrimmedString,
	values: Yup.array().when(
		'operator',
		(operator, schema) => (OPERATIONS_TYPES[operator] === 'field' ? schema : schema.of(valueType)),
	),
});

const GroupSchema = Yup.object().shape({
	name: requiredTrimmedString,
	description: nullableString.max(1200, formatMessage({
		id: 'validation.group.description.error.max',
		defaultMessage: 'Description is limited to 1200 characters',
	})),
	rules: Yup.array().when(
		'$isSmart',
		(isSmart, schema) => (isSmart ? schema.required().min(1) : schema),
	),
});

export const NewCollectionSchema = Yup.object().shape({
	collection: requiredTrimmedString
		.max(120, formatMessage({
			id: 'validation.groupCollection.name.error.max',
			defaultMessage: 'Collection title is limited to 120 characters',
		}))
		.test(
			'alreadyExistingCollection',
			formatMessage({
				id: 'validation.groupCollection.name.alreadyExisting',
				defaultMessage: 'Collection already exists in parent',
			}),
			(collection, testContext) => {
				const { parent } = testContext.parent;
				const { prefixesCombinations } = testContext.options.context;
				const newValue = parent.concat(collection);
				return !prefixesCombinations.some((prefix) => isEqual(prefix, newValue));
			},
		),
});

export const GroupSettingsSchema = Yup.object().shape({
	group: GroupSchema,
});
