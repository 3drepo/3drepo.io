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
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { MultiSelect } from '@controls/inputs/multiSelect/multiSelect.component';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { PropertyDefinition } from '@/v5/store/tickets/tickets.types';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';
import { AssigneesMultiSelect } from '@controls/assigneesSelect/assigneesMultiSelect.component';

type ManyOfPropertyProps = FormInputProps & {
	open?: boolean;
	values: PropertyDefinition['values'];
	onClose: () => void;
	onOpen: () => void;
};

export const ManyOfProperty = ({ values, ...props }: ManyOfPropertyProps) => {
	let items = [];

	if (values === 'jobsAndUsers') {
		return (
			<FormControl required={props.required} disabled={props.disabled} error={props.error} className={props.className}>
				<InputLabel id={`${props.name}-label`}>{props.label}</InputLabel>
				<AssigneesMultiSelect
					maxItems={20}
					showAddButton
					multiple
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
		<MultiSelect {...props} value={props.value || []}>
			{(items).map((value) => <MultiSelectMenuItem key={value} value={value}>{value}</MultiSelectMenuItem>)}
		</MultiSelect>
	);
};
