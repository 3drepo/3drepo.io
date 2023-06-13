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

import { formatMessage } from '@/v5/services/intl';
import { IGroupRule } from '@/v5/store/tickets/tickets.types';

export const OPERATION_DISPLAY_NAMES = {
	EXISTS: formatMessage({ id: 'filter.operation.exists', defaultMessage: 'exists' }),
	NOT_EXISTS: formatMessage({ id: 'filter.operation.doesNotExist', defaultMessage: 'does not exist' }),
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
};

export type IRuleForm = Omit<IGroupRule, 'values'> & {
	values: { value: number | string }[],
};

export const parseRule = ({ values, ...rule }: IRuleForm): IGroupRule => {
	if (values?.length) {
		return {
			...rule,
			values: values.map((v) => v.value),
		};
	}
	return rule;
};

export const prepareRuleForForm = ({ values = [], ...rule }: IGroupRule): IRuleForm => ({
	...rule,
	values: values.map((value) => ({ value })),
});
