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
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';
import { AssigneesSelect } from '@controls/assigneesSelect/assigneesSelect.component';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { Select } from '@controls/inputs/select/select.component';
import { FormControl, FormHelperText, InputLabel, MenuItem } from '@mui/material';

type OneOfPropertyProps = FormInputProps & { values: PropertyDefinition['values']; onBlur: () => void };
export const OneOfProperty = ({ values, value, ...props }: OneOfPropertyProps) => {
	let items = [];
	if (values === 'jobsAndUsers') {
		return (
			<FormControl required={props.required} disabled={props.disabled} error={props.error} className={props.className}>
				<InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
				<AssigneesSelect
					value={value}
					showAddButton
					{...props}
				/>
				<FormHelperText>{props.helperText}</FormHelperText>
			</FormControl>
		);
	} if (values === 'riskCategories') {
		items = TicketsHooksSelectors.selectRiskCategories() || [];
	} else {
		items = (values as string[]);
	}
	return (
		<Select {...props} value={value ?? ''}>
			{(items as string[]).map((propValue) => (
				<MenuItem key={propValue} value={propValue}>
					{propValue}
				</MenuItem>
			))}
		</Select>
	);
};
