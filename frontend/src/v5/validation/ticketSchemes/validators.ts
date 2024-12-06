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
import { trimmedString } from '../shared/validators';
import { MAX_LONG_TEXT_LENGTH, MAX_TEXT_LENGTH } from '@/v5/store/tickets/tickets.validators';
import { getOperatorMaxFieldsAllowed } from '@components/viewer/cards/cardFilters/filterForm/filterForm.helpers';
import { isTextType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';

const getValueType = (type) => {
	if (isTextType(type)) {
		return trimmedString.required().max(type === 'longText' ? MAX_LONG_TEXT_LENGTH : MAX_TEXT_LENGTH);
	}
	return trimmedString;
};

export const FilterSchema = Yup.object().shape({
	operator: trimmedString,
	values: Yup.array()
		.when(
			'$type',
			(type, schema) => schema.of(Yup.object({ value: getValueType(type) })),
		)
		.when(
			'operator',
			(operator, schema) => {
				const maxFields = getOperatorMaxFieldsAllowed(operator);
				return schema.min(Math.min(maxFields, 1));
			},
		),
});
