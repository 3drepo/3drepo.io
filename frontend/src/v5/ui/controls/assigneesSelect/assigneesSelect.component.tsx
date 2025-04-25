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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { useContext } from 'react';
import { SelectProps } from '@controls/inputs/select/select.component';
import { SearchContextComponent } from '@controls/search/searchContext';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { AssigneesListContainer } from './assigneesSelect.styles';
import { AssigneesSelectMenu } from './assigneesSelectMenu/assigneesSelectMenu.component';
import { TicketContext } from '../../routes/viewer/tickets/ticket.context';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { AssigneesValuesDisplay } from './assigneeValuesDisplay/assigneeValuesDisplay.component';
import { getInvalidValues, getModelJobsAndUsers, getValidValues } from './assignees.helpers';

export type AssigneesSelectProps = Pick<FormInputProps, 'value'> & SelectProps & {
	maxItems?: number;
	canClear?: boolean;
	onBlur?: () => void;
	excludeViewers?: boolean;
	emptyListMessage?: string;
	excludeJobs?: boolean;
};

export const AssigneesSelect = ({
	value: valueRaw,
	maxItems,
	multiple,
	className,
	excludeViewers = false,
	helperText,
	onChange,
	onBlur,
	canClear = false,
	disabled,
	emptyListMessage,
	...props
}: AssigneesSelectProps) => {
	const { containerOrFederation } = useContext(TicketContext);
	const { jobs, users } = getModelJobsAndUsers(containerOrFederation);

	const emptyValue = multiple ? [] : '';
	const value = valueRaw || emptyValue;
	const valueAsArray = multiple ? value : [value].filter(Boolean);
	const validValues = getValidValues([...jobs, ...users], excludeViewers);
	const invalidValues = getInvalidValues(valueAsArray, validValues);

	const teamspaceJobsAndUsers = UsersHooksSelectors.selectJobsAndUsersByIds();
	const valueToJobOrUser = (val: string) => teamspaceJobsAndUsers[val];
	const allJobsAndUsersToDisplay = [
		...validValues.map(valueToJobOrUser),
		...invalidValues.map((v) => valueToJobOrUser(v) || ({ notFoundName: v })),
	];

	const handleChange = (e) => {
		if (!multiple) return onChange(e);
		const validVals = e.target.value.filter((v) => !invalidValues.includes(v));
		onChange({ target: { value: validVals } });
	};

	const handleClear = () => {
		onChange({ target: { value: emptyValue } });
		onBlur?.();
	};

	if (!users.length || !jobs.length) return (
		<AssigneesListContainer className={className}>
			<Spinner />
		</AssigneesListContainer>
	);
	return (
		<SearchContextComponent fieldsToFilter={['_id', 'firstName', 'lastName', 'job', 'notFoundName']} items={allJobsAndUsersToDisplay}>
			<AssigneesListContainer className={className}>
				<AssigneesSelectMenu
					value={value}
					multiple={multiple}
					isInvalid={(v) => invalidValues.includes(v)}
					onChange={handleChange}
					onBlur={onBlur}
					disabled={disabled}
					{...props}
				/>
				<AssigneesValuesDisplay
					value={valueAsArray}
					maxItems={maxItems}
					onClear={canClear && !disabled && valueAsArray?.length ? handleClear : undefined}
					emptyListMessage={emptyListMessage}
				/>
			</AssigneesListContainer>
		</SearchContextComponent>
	);
};
