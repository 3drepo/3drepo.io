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
import _ from 'lodash';

const requiredTrimmedString = Yup.string().trim().required(
	formatMessage({
		id: 'validation.ticket.groupFilters.error.required',
		defaultMessage: 'This is a required field',
	}),
);

const valueType = Yup.object({ value: requiredTrimmedString });

export const GroupRulesSchema = Yup.object().shape({
	field: requiredTrimmedString,
	operator: requiredTrimmedString,
	values: Yup.array().of(valueType),
});

const GroupSchema = Yup.object().shape({
	name: requiredTrimmedString,
	description: Yup.string().max(1200, formatMessage({
		id: 'validation.model.name.error.max',
		defaultMessage: 'Description is limited to 1200 characters',
	})),
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
				return !prefixesCombinations.some((prefix) => _.isEqual(prefix, newValue));
			},
		),
});

export const GroupSettingsSchema = Yup.object().shape({
	group: GroupSchema,
});
