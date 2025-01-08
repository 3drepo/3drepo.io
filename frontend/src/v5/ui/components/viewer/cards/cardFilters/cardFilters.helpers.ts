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
import { compact } from 'lodash';

export const FILTER_OPERATOR_ICON: Record<CardFilterOperator, any> = {
	eq: EqualIcon,
	neq: NotEqualIcon,
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

export const FILTER_OPERATOR_LABEL: Record<CardFilterOperator, string> = {
	ex: formatMessage({ id: 'cardFilter.operator.exists', defaultMessage: 'Exists' }),
	nex: formatMessage({ id: 'cardFilter.operator.doesNotExist', defaultMessage: 'Does not exist' }),
	eq: formatMessage({ id: 'cardFilter.operator.equals', defaultMessage: 'Equals' }),
	neq: formatMessage({ id: 'cardFilter.operator.doesNotEqual', defaultMessage: 'Does not equal' }),
	gt: formatMessage({ id: 'cardFilter.operator.greaterThan', defaultMessage: 'Greater than' }),
	gte: formatMessage({ id: 'cardFilter.operator.greaterOrEqualTo', defaultMessage: 'Greater or equal to' }),
	lt: formatMessage({ id: 'cardFilter.operator.lessThan', defaultMessage: 'Less than' }),
	lte: formatMessage({ id: 'cardFilter.operator.lessOrEqualTo', defaultMessage: 'Less or equal to' }),
	rng: formatMessage({ id: 'cardFilter.operator.inRange', defaultMessage: 'In range' }),
	nrng: formatMessage({ id: 'cardFilter.operator.notInRange', defaultMessage: 'Not in range' }),
	ss: formatMessage({ id: 'cardFilter.operator.contains', defaultMessage: 'Contains' }),
	nss: formatMessage({ id: 'cardFilter.operator.notContain', defaultMessage: 'Does not contain' }),
};

export const getFilterFormTitle = (elements: string[]) => compact(elements).join(' : ');

export const isRangeOperator = (operator: CardFilterOperator) => ['rng', 'nrng'].includes(operator);

export const isTextType = (type: CardFilterType) => ['ticketId', 'ticketTitle', 'text', 'longText'].includes(type);
export const isSelectType = (type: CardFilterType) => ['template', 'oneOf', 'manyOf'].includes(type);
export const getValidOperators = (type: CardFilterType): CardFilterOperator[] => {
	if (isTextType(type)) return ['eq', 'neq', 'ss', 'nss', 'ex', 'nex'];
	if (type === 'number') return ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'rng', 'nrng', 'ex', 'nex'];
	if (isSelectType(type)) {
		if (type === 'template') return ['eq', 'neq'];
		return ['eq', 'neq', 'ex', 'nex'];
	}
	
	return Object.keys(FILTER_OPERATOR_LABEL) as CardFilterOperator[];
};
