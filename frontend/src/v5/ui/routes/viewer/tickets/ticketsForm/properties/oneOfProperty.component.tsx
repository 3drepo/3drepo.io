/**
 *  Copyright (C) 2022 3D Repo Ltd
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

import { TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Select } from '@controls/inputs/Select/Select.component';
import { MenuItem } from '@mui/material';
import { PropertyProps } from './properties.types';

export const OneOfProperty = ({ property: { name, readOnly, required, values }, ...props }: PropertyProps) => {
	const riskCategories: string[] = TicketsHooksSelectors.selectRiskCategories() || [];
	const valuesArray = (values === 'riskCategories') ? riskCategories : values;
	return (
		<Select label={name} disabled={readOnly} required={required} {...props}>
			{(valuesArray as string[]).map((propValue) => (
				<MenuItem key={propValue} value={propValue}>
					{propValue}
				</MenuItem>
			))}
		</Select>
	);
};
