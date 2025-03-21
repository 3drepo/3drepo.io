/**
 *  Copyright (C) 2024 3D Repo Ltd
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

import EqualIcon from '@assets/icons/filters/equal.svg';
import GreaterEqualThanIcon from '@assets/icons/filters/greater_than_equal.svg';
import GreaterEqualIcon from '@assets/icons/filters/greater_than.svg';
import NotEqualIcon from '@assets/icons/filters/not_equal.svg';
import LessThanIcon from '@assets/icons/filters/less_than.svg';
import LessEqualThanIcon from '@assets/icons/filters/less_than_equal.svg';
import InRangeIcon from '@assets/icons/filters/in_range.svg';
import NotInRangeIcon from '@assets/icons/filters/not_in_range.svg';
import ExistIcon from '@assets/icons/filters/exist.svg';
import NotExistIcon from '@assets/icons/filters/not_exist.svg';
import ContainIcon from '@assets/icons/filters/contain.svg';
import NotContainIcon from '@assets/icons/filters/not_contain.svg';
import { formatMessage } from '@/v5/services/intl';
import { CardFilterOperator, CardFilterType } from './cardFilters.types';
import { compact, floor } from 'lodash';
import { isBaseProperty } from './filtersSelection/tickets/ticketFilters.helpers';

export const FILTER_OPERATOR_ICON: Record<CardFilterOperator, any> = {
	eq: EqualIcon,
	neq: NotEqualIcon,
	is: EqualIcon,
	nis: NotEqualIcon,
	gt: GreaterEqualIcon,
	gte: GreaterEqualThanIcon,
	lt: LessThanIcon,
	lte: LessEqualThanIcon,
	rng: InRangeIcon,
	nrng: NotInRangeIcon,
	ex: ExistIcon,
	nex: NotExistIcon,
	ss: ContainIcon,
	nss: NotContainIcon,
} as const;

const FILTER_OPERATOR_LABEL: Record<CardFilterOperator, string> = {
	ex: formatMessage({ id: 'cardFilter.operator.exists', defaultMessage: 'Exists' }),
	nex: formatMessage({ id: 'cardFilter.operator.doesNotExist', defaultMessage: 'Does not exist' }),
	eq: formatMessage({ id: 'cardFilter.operator.equals', defaultMessage: 'Equals' }),
	neq: formatMessage({ id: 'cardFilter.operator.doesNotEqual', defaultMessage: 'Does not equal' }),
	is: formatMessage({ id: 'cardFilter.operator.is', defaultMessage: 'Is' }),
	nis: formatMessage({ id: 'cardFilter.operator.isNot', defaultMessage: 'Is not' }),
	gt: formatMessage({ id: 'cardFilter.operator.greaterThan', defaultMessage: 'Greater than' }),
	gte: formatMessage({ id: 'cardFilter.operator.greaterOrEqualTo', defaultMessage: 'Greater or equal to' }),
	lt: formatMessage({ id: 'cardFilter.operator.lessThan', defaultMessage: 'Less than' }),
	lte: formatMessage({ id: 'cardFilter.operator.lessOrEqualTo', defaultMessage: 'Less or equal to' }),
	rng: formatMessage({ id: 'cardFilter.operator.inRange', defaultMessage: 'In range' }),
	nrng: formatMessage({ id: 'cardFilter.operator.notInRange', defaultMessage: 'Not in range' }),
	ss: formatMessage({ id: 'cardFilter.operator.contains', defaultMessage: 'Contains' }),
	nss: formatMessage({ id: 'cardFilter.operator.notContain', defaultMessage: 'Does not contain' }),
};

const DATE_FILTER_OPERATOR_LABEL: Record<CardFilterOperator, string> = {
	...FILTER_OPERATOR_LABEL,
	gte: formatMessage({ id: 'cardFilter.date.operator.onOrAfter', defaultMessage: 'On or after' }),
	lte: formatMessage({ id: 'cardFilter.date.operator.onOrBefore', defaultMessage: 'On or before' }),
};

export const isDateType = (type: CardFilterType) => ['date', 'pastDate', 'createdAt', 'updatedAt', 'sequencing'].includes(type);
export const isTextType = (type: CardFilterType) => ['ticketCode', 'title', 'text', 'longText'].includes(type);
export const isSelectType = (type: CardFilterType) => ['template', 'oneOf', 'manyOf', 'owner', 'status'].includes(type);

export const getFilterOperatorLabels = (type: CardFilterType) => isDateType(type) ? DATE_FILTER_OPERATOR_LABEL : FILTER_OPERATOR_LABEL;

export const getFilterFormTitle = (elements: string[]) => compact(elements).join(' : ');

export const floorToMinute = (time) => 60000 * floor(time / 60000);
export const amendDateUpperBounds = (bounds) => {
	return bounds.map((bound, i) => {
		if (i !== bounds.length - 1) return bound;
		return floorToMinute(bound) + 59999;
	});
};

export const isRangeOperator = (operator: CardFilterOperator) => ['rng', 'nrng'].includes(operator);
	
export const getValidOperators = (type: CardFilterType): CardFilterOperator[] => {
	if (isTextType(type)) {
		if (isBaseProperty(type)) return ['is', 'nis', 'ss', 'nss'];
		return ['ex', 'nex', 'is', 'nis', 'ss', 'nss'];
	}
	if (type === 'number') return ['ex', 'nex', 'eq', 'neq', 'gte', 'lte', 'rng', 'nrng'];
	if (isDateType(type)) {
		if (isBaseProperty(type)) return ['gte', 'lte', 'rng', 'nrng'];
		return ['ex', 'nex', 'gte', 'lte', 'rng', 'nrng'];
	}
	if (type === 'boolean') return ['eq', 'ex', 'nex'];
	if (isSelectType(type)) {
		if (isBaseProperty(type)) return ['is', 'nis'];
		return ['ex', 'nex', 'is', 'nis'];
	}
	return Object.keys(FILTER_OPERATOR_LABEL) as CardFilterOperator[];
};

export const getDefaultOperator = (type) => {
	if (isTextType(type) || isSelectType(type)) return 'is';
	if (isDateType(type)) return 'lte';
	return 'eq';
};