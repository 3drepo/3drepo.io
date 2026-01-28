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

import { mapFormArrayToArray } from '@/v5/helpers/form.helper';
import { isDateType, isSelectType } from '@components/viewer/cards/cardFilters/cardFilters.helpers';
import { TicketFilterType } from '@components/viewer/cards/cardFilters/cardFilters.types';
import { isJobsAndUsersProperty, getSelectOptions } from '@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.component';
import { Value } from '@components/viewer/cards/cardFilters/filterForm/filterFormValues/filterFormValues.styles';
import { getFilterFromEvent } from '@components/viewer/cards/cardFilters/filtersSelection/tickets/ticketFilters.helpers';
import { FormNumberField, FormBooleanSelect, FormSelect, FormDateTime, FormJobsAndUsersSelect, FormMultiSelect, FormTextField } from '@controls/inputs/formInputs.component';
import { MultiSelectMenuItem } from '@controls/inputs/multiSelect/multiSelectMenuItem/multiSelectMenuItem.component';
import { MenuItem as SingleSelectMenuItem } from '@mui/material';
import { compact } from 'lodash';

type InputFieldProps = {
	module: string;
	property: string;
	type: TicketFilterType;
	name: string;
	templateId: string;
	projectId: string;
	formError?: string;
};
export const BulkEditInputField = ({ module, property, templateId, projectId, type, ...inputProps }: InputFieldProps) => {
	if (type === 'number') return <FormNumberField {...inputProps} />;
	if (type === 'boolean') return <FormBooleanSelect {...inputProps} />;
	if (isDateType(type)) return <FormDateTime {...inputProps} />;
	if (isJobsAndUsersProperty(module, property, type)) return (
		<FormJobsAndUsersSelect
			multiple
			maxItems={19}
			transformInputValue={(v) => compact(mapFormArrayToArray(v))}
			transformOutputValue={(e) => getFilterFromEvent(e)}
			excludeJobs={(type === 'owner')}
			usersAndJobs={getSelectOptions(module, property, type).map(({ value }) => value)}
			{...inputProps}
		/>
	);
	if (isSelectType(type)) {
		const selectOptions = getSelectOptions(module, property, type);
		const SelectInput = type === 'manyOf' ? FormMultiSelect : FormSelect;
		const MenuItem = type === 'manyOf' ? MultiSelectMenuItem : SingleSelectMenuItem;
		return (
			<SelectInput {...inputProps}>
				{selectOptions.map(({ value, ...optionProps }) => (
					<MenuItem key={value} value={value} {...optionProps}>
						<Value>{value}</Value>
					</MenuItem>
				))}
			</SelectInput>
		);
	}
	return <FormTextField {...inputProps} />;
};
