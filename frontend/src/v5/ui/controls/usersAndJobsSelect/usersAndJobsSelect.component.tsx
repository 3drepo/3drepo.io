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

import { UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { SelectProps } from '@controls/inputs/select/select.component';
import { SearchContextComponent } from '@controls/search/searchContext';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';
import { AssigneesListContainer } from '@controls/assigneesSelect/assigneesSelect.styles';
import { AssigneesSelectMenu } from '@controls/assigneesSelect/assigneesSelectMenu/assigneesSelectMenu.component';
import { AssigneesValuesDisplay } from '@controls/assigneesSelect/assigneeValuesDisplay/assigneeValuesDisplay.component';


export type UserOrJobId = string;


export type UsersAndJobsSelectProps = Pick<FormInputProps, 'value'> & SelectProps & {
	maxItems?: number;
	canClear?: boolean;
	emptyListMessage?: string;
	onClear?: () => void;
	excludeJobs?: boolean
	usersAndJobs?: string[];
	isValidItem?: (val: string) => boolean;
};

export const UsersAndJobsSelect = ({
	value: valueRaw,
	maxItems,
	multiple,
	className,
	helperText,
	onChange,
	onClear,
	canClear = false,
	disabled,
	emptyListMessage,
	usersAndJobs = [],
	isValidItem = ()=> true,
	...props
}: UsersAndJobsSelectProps) => {

	const emptyValue = multiple ? [] : '';
	const value = valueRaw || emptyValue;
	const valueAsArray = multiple ? value : [value].filter(Boolean);

	const teamspaceJobsAndUsers = UsersHooksSelectors.selectJobsAndUsersByIds();
	const valueToJobOrUser = (val: string) => teamspaceJobsAndUsers[val];
	const allJobsAndUsersToDisplay = usersAndJobs.map((v) => valueToJobOrUser(v) || ({ notFoundName: v }));

	const handleChange = (e) => {
		if (!multiple) return onChange(e);
		const validVals = e.target.value.filter((v) => isValidItem(v));
		onChange({ target: { value: validVals } });
	};

	if (!Object.keys(teamspaceJobsAndUsers).length) return (
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
					isValidItem={isValidItem}
					onChange={handleChange}
					disabled={disabled}
					{...props}
				/>
				<AssigneesValuesDisplay
					value={valueAsArray}
					maxItems={maxItems}
					onClear={canClear && !disabled && valueAsArray?.length ? onClear : undefined}
					emptyListMessage={emptyListMessage}
				/>
			</AssigneesListContainer>
		</SearchContextComponent>
	);
};
