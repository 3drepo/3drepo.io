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
import GreaterEqualThanIcon from '@assets/icons/filters/greater_than_equal';
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

export const FILTER_OPERATOR_ICON = {
	equal: EqualIcon,
	notEqual: NotEqualIcon,
	greaterThan: GreaterEqualIcon,
	greaterThanEqual: GreaterEqualThanIcon,
	lessThan: LessThanIcon,
	lessThanEqual: LessEqualThanIcon,
	inRange: InRangeIcon,
	notInRange: NotInRangeIcon,
	exist: ExistIcon,
	notExist: NotExistIcon,
	contain: ContainIcon,
	notContain: NotContainIcon,
} as const;

export const FILTER_OPERATOR_LABEL = {
	exist: formatMessage({ id: 'cardFilter.operator.exists', defaultMessage: 'Exists' }),
	notExist: formatMessage({ id: 'cardFilter.operator.doesNotExist', defaultMessage: 'Does not exist' }),
	equal: formatMessage({ id: 'cardFilter.operator.equals', defaultMessage: 'Equals' }),
	notEqual: formatMessage({ id: 'cardFilter.operator.doesNotEqual', defaultMessage: 'Does not equal' }),
	greaterThan: formatMessage({ id: 'cardFilter.operator.greaterThan', defaultMessage: 'Greater than' }),
	greaterThanEqual: formatMessage({ id: 'cardFilter.operator.greaterOrEqualTo', defaultMessage: 'Greater or equal to' }),
	lessThan: formatMessage({ id: 'cardFilter.operator.lessThan', defaultMessage: 'Less than' }),
	lessThanEqual: formatMessage({ id: 'cardFilter.operator.lessOrEqualTo', defaultMessage: 'Less or equal to' }),
	inRange: formatMessage({ id: 'cardFilter.operator.inRange', defaultMessage: 'In range' }),
	notInRange: formatMessage({ id: 'cardFilter.operator.notInRange', defaultMessage: 'Not in range' }),
	contain: formatMessage({ id: 'cardFilter.operator.contain', defaultMessage: 'Contains' }),
	notContain: formatMessage({ id: 'cardFilter.operator.notContain', defaultMessage: 'Does not contain' }),
};
