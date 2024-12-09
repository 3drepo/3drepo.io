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

import { mapArrayToFormArray, mapFormArrayToArray } from '@/v5/helpers/form.helper';
import { formatMessage } from '@/v5/services/intl';
import { FieldOperator, IGroupRule, Operator } from '@/v5/store/tickets/tickets.types';

export const OPERATION_DISPLAY_NAMES = {
	IS_NOT_EMPTY: formatMessage({ id: 'filter.operation.exists', defaultMessage: 'exists' }),
	IS_EMPTY: formatMessage({ id: 'filter.operation.doesNotExist', defaultMessage: 'does not exist' }),
	IS: formatMessage({ id: 'filter.operation.is', defaultMessage: 'is' }),
	IS_NOT: formatMessage({ id: 'filter.operation.isNot', defaultMessage: 'is not' }),
	CONTAINS: formatMessage({ id: 'filter.operation.contains', defaultMessage: 'contains' }),
	NOT_CONTAINS: formatMessage({ id: 'filter.operation.doesNotContain', defaultMessage: 'does not contain' }),
	REGEX: formatMessage({ id: 'filter.operation.regex', defaultMessage: 'regex' }),
	EQUALS: formatMessage({ id: 'filter.operation.equals', defaultMessage: 'equals' }),
	NOT_EQUALS: formatMessage({ id: 'filter.operation.doesNotEqual', defaultMessage: 'does not equal' }),
	GT: formatMessage({ id: 'filter.operation.greaterThan', defaultMessage: 'greater than' }),
	GTE: formatMessage({ id: 'filter.operation.greaterOrEqualTo', defaultMessage: 'greater or equal to' }),
	LT: formatMessage({ id: 'filter.operation.lessThan', defaultMessage: 'less than' }),
	LTE: formatMessage({ id: 'filter.operation.lessOrEqualTo', defaultMessage: 'less or equal to' }),
	IN_RANGE: formatMessage({ id: 'filter.operation.inRange', defaultMessage: 'in range' }),
	NOT_IN_RANGE: formatMessage({ id: 'filter.operation.notInRange', defaultMessage: 'not in range' }),
	STARTS_WITH: formatMessage({ id: 'filter.operation.startsWith', defaultMessage: 'starts with' }),
	ENDS_WITH: formatMessage({ id: 'filter.operation.endsWith', defaultMessage: 'ends with' }),
};

export type IFormRule = {
	name: string,
	field: {
		operator: FieldOperator,
		values: { value: string }[],
	},
	operator: Operator,
	values?: { value: number | string }[],
};

export const formRuleToGroupRule = ({ values, field, ...rule }: IFormRule): IGroupRule => ({
	...rule,
	field: {
		operator: field.operator,
		values: mapFormArrayToArray(field.values),
	},
	values: mapFormArrayToArray(values),
});

export const groupRuleToFormRule = ({ values, field, ...rule }: IGroupRule): IFormRule => ({
	...rule,
	field: {
		operator: field.operator,
		values: mapArrayToFormArray(field.values),
	},
	values: mapArrayToFormArray(values),
});

export const appendCopySuffixToDuplicateNames = (existingRules: IGroupRule[], newRules: IGroupRule[]) => {
	const existingNames = new Set((existingRules || []).map(({ name }) => name));
	const newSelectedCriteria = newRules.map((criterion) => {
		let { name } = criterion;
		if (!existingNames.has(name)) {
			existingNames.add(name);
			return criterion;
		}

		let count = 1;
		do {
			name = name.replace(/(.*) - Copy \(\d\)/, '$1');
			name = `${name} - Copy (${count++})`;
		} while (existingNames.has(name));
		
		existingNames.add(name);
		return { ...criterion, name };
	});
	return newSelectedCriteria;
};
