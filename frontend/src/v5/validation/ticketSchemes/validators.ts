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
import { requiredNumber, numberRange, trimmedString } from '../shared/validators';
import { MAX_LONG_TEXT_LENGTH, MAX_TEXT_LENGTH } from '@/v5/store/tickets/tickets.validators';
import { getOperatorMaxFieldsAllowed } from '@components/viewer/cards/cardFilters/filterForm/filterForm.helpers';
import { isRangeOperator, isDateType, isTextType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';
import { CardFilterOperator, CardFilterType } from '@components/viewer/cards/cardFilters/cardFilters.types';

const getValueValidator = (type: CardFilterType) => {
	if (isTextType(type)) return trimmedString.required().max(type === 'longText' ? MAX_LONG_TEXT_LENGTH : MAX_TEXT_LENGTH);
	if (isDateType(type) || type === 'number') return requiredNumber();
	return trimmedString;
};

export const FilterSchema = Yup.object().shape({
	operator: trimmedString,
	values: Yup.array()
		.when(
			['operator', '$type'],
			// @ts-ignore
			(operator: CardFilterOperator, filterType: CardFilterType, schema) => {
				const value = isRangeOperator(operator) ? numberRange() : getValueValidator(filterType);
				return schema.of(Yup.object({ value: value }));
			},
		)
		.when(
			'operator',
			(operator, schema) => {
				const maxFields = getOperatorMaxFieldsAllowed(operator);
				return schema.min(Math.min(maxFields, 1));
			},
		),
});
