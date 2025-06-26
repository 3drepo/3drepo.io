/**
 *  Copyright (C) 2025 3D Repo Ltd
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
import { Select, SelectProps } from '../select/select.component';
import { MenuItem } from '@mui/material';
import { isBoolean } from 'lodash';

export const TRUE_LABEL = formatMessage({ id: 'select.booleanValue.true', defaultMessage: 'True' });
export const FALSE_LABEL = formatMessage({ id: 'select.booleanValue.false', defaultMessage: 'False' });

export type BooleanSelectProps = Omit<SelectProps, 'children'>;
export const BooleanSelect = (props: BooleanSelectProps) => {
	const renderValue = (value) => {
		if (!isBoolean(value)) return '';
		return value ? TRUE_LABEL : FALSE_LABEL;
	};

	return (
		<Select renderValue={renderValue} {...props}>
			<MenuItem value={true as any}>{TRUE_LABEL}</MenuItem>
			<MenuItem value={false as any}>{FALSE_LABEL}</MenuItem>
		</Select>
	);
};