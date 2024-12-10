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
import { useCallback, useContext, useState } from 'react';
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
	showAddButton?: boolean;
	showEmptyText?: boolean;
	onBlur?: () => void;
	excludeViewers?: boolean;
};

export const AssigneesSelect = ({
	value: valueRaw,
	maxItems,
	showAddButton,
	showEmptyText,
	multiple,
	disabled,
	onBlur,
	className,
	excludeViewers = false,
	onChange,
	...props
}: AssigneesSelectProps) => {
	const [open, setOpen] = useState(false);
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
		...validValues.map((v) => valueToJobOrUser || ({ invalidItemName: v })),
		...invalidValues.map((v) => valueToJobOrUser(v) || ({ invalidItemName: v })),
	];

	const handleChange = (e) => {
		if (!multiple) return onChange(e);
		const validVals = e.target.value.filter((v) => !invalidValues.includes(v));
		onChange({ target: { value: validVals } });
	};

	const handleOpen = useCallback((e) => {
		if (disabled) return;
		e.stopPropagation();
		setOpen(true);
	}, [disabled]);

	const handleClose = () => {
		setOpen(false);
		onBlur();
	};

	if (!users.length || !jobs.length) return (
		<AssigneesListContainer className={className}>
			<Spinner />
		</AssigneesListContainer>
	);
	return (
		<SearchContextComponent fieldsToFilter={['_id', 'firstName', 'lastName', 'job', 'invalidItemName']} items={allJobsAndUsersToDisplay}>
			<AssigneesListContainer onClick={handleOpen} className={className}>
				<AssigneesSelectMenu
					open={open}
					value={value}
					onClose={handleClose}
					onOpen={handleOpen}
					disabled={disabled}
					multiple={multiple}
					isInvalid={(v) => invalidValues.includes(v)}
					onChange={handleChange}
					{...props}
				/>
				<AssigneesValuesDisplay
					value={valueAsArray}
					maxItems={maxItems}
					showEmptyText={showEmptyText}
					disabled={disabled || !showAddButton}
				/>
			</AssigneesListContainer>
		</SearchContextComponent>
	);
};
