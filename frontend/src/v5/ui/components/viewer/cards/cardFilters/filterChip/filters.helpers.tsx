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
import { formatMessage } from '@/v5/services/intl';

export const FILTER_ICON = {
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
} as const;

export type FilterType = keyof typeof FILTER_ICON;

export const FILTER_LABEL: Record<FilterType, string> = {
	exist: formatMessage({ id: 'cardFilter.exists', defaultMessage: 'exists' }),
	notExist: formatMessage({ id: 'cardFilter.doesNotExist', defaultMessage: 'does not exist' }),
	equal: formatMessage({ id: 'cardFilter.equals', defaultMessage: 'equals' }),
	notEqual: formatMessage({ id: 'cardFilter.doesNotEqual', defaultMessage: 'does not equal' }),
	greaterThan: formatMessage({ id: 'cardFilter.greaterThan', defaultMessage: 'greater than' }),
	greaterThanEqual: formatMessage({ id: 'cardFilter.greaterOrEqualTo', defaultMessage: 'greater or equal to' }),
	lessThan: formatMessage({ id: 'cardFilter.lessThan', defaultMessage: 'less than' }),
	lessThanEqual: formatMessage({ id: 'cardFilter.lessOrEqualTo', defaultMessage: 'less or equal to' }),
	inRange: formatMessage({ id: 'cardFilter.inRange', defaultMessage: 'in range' }),
	notInRange: formatMessage({ id: 'cardFilter.notInRange', defaultMessage: 'not in range' }),
};
