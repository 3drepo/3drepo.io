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

import { ContainersHooksSelectors, FederationsHooksSelectors, UsersHooksSelectors } from '@/v5/services/selectorsHooks';
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { FormattedMessage } from 'react-intl';
import { useCallback, useContext, useState } from 'react';
import { SelectProps } from '@controls/inputs/select/select.component';
import { formatMessage } from '@/v5/services/intl';
import AddUserIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { SearchContextComponent } from '@controls/search/searchContext';
import { FormInputProps } from '@controls/inputs/inputController.component';
import { AddUserButton, AssigneesListContainer, Tooltip } from './assigneesSelect.styles';
import { AssigneesSelectMenu } from './assigneesSelectMenu/assigneesSelectMenu.component';
import { AssigneeCircle } from './assigneeCircle/assigneeCircle.component';
import { ExtraAssigneesPopover } from './extraAssigneesCircle/extraAssigneesPopover.component';
import { ExtraAssigneesCircle } from './extraAssigneesCircle/extraAssignees.styles';
import { modelIsFederation } from '@/v5/store/tickets/tickets.helpers';
import { TicketContext } from '../../routes/viewer/tickets/ticket.context';
import { Spinner } from '@controls/spinnerLoader/spinnerLoader.styles';

export type AssigneesSelectProps = Pick<FormInputProps, 'value'> & SelectProps & {
	maxItems?: number;
	showAddButton?: boolean;
	showEmptyText?: boolean;
	onBlur?: () => void;
	filterViewers?: boolean;
};

export const AssigneesSelect = ({
	value: valueRaw,
	maxItems = 3,
	showAddButton = false,
	showEmptyText = false,
	multiple,
	disabled,
	onBlur,
	className,
	filterViewers = false,
	onChange,
	...props
}: AssigneesSelectProps) => {
	const [open, setOpen] = useState(false);
	const { containerOrFederation } = useContext(TicketContext);
	
	const isFed = modelIsFederation(containerOrFederation);

	const modelUsers = isFed
		? FederationsHooksSelectors.selectFederationUsers(containerOrFederation)
		: ContainersHooksSelectors.selectContainerUsers(containerOrFederation);

	const modelJobs = isFed
		? FederationsHooksSelectors.selectFederationJobs(containerOrFederation)
		: ContainersHooksSelectors.selectContainerJobs(containerOrFederation);

	const teamspaceJobsAndUsers = UsersHooksSelectors.selectJobsAndUsers();
	const modelJobsAndUsers = [...modelUsers, ...modelJobs];

	const emptyValue = multiple ? [] : '';
	const value = valueRaw || emptyValue;

	const jobOrUserToString = (ju): string | null => (ju._id || ju.user);
	const validJobsAndUsers = filterViewers ? modelJobsAndUsers.filter((ju) => (!ju?.isViewer)) : modelJobsAndUsers;
	const validValues = validJobsAndUsers.map(jobOrUserToString);
	const invalidValues = (multiple ? value : [value]).filter((val) => !validValues.includes(val));

	const handleChange = (e) => {
		if (!multiple) return onChange(e);
		const validVals = e.target.value.filter((v) => !invalidValues.includes(v));
		onChange({ target: { value: validVals } });
	};
	// Using this logic instead of a simple partition because ExtraAssigneesCircle needs to occupy
	// the last position when the overflow value is 2+. There is no point showing +1 overflow
	// since the overflowing assignee could just be displayed instead
	const overflowRequired = multiple && value.length > maxItems;
	const listedAssignees = overflowRequired ? value.slice(0, maxItems - 1) : value;
	const overflowValue = overflowRequired ? value.slice(maxItems - 1).length : 0;
	const handleOpen = useCallback((e) => {
		if (disabled) return;
		e.stopPropagation();
		setOpen(true);
	}, [disabled]);

	const handleClose = () => {
		setOpen(false);
		onBlur();
	};

	const valueToJobOrUser = (val: string) => teamspaceJobsAndUsers.find((ju) => jobOrUserToString(ju) === val);
	const allJobsAndUsersToDisplay = [
		...validValues.map(valueToJobOrUser),
		...invalidValues.map((v) => valueToJobOrUser(v) || ({ invalidItemName: v })),
	];

	if (!modelUsers.length || !modelJobs.length) return (
		<AssigneesListContainer className={className}>
			<Spinner />
		</AssigneesListContainer>
	);
	return (
		<SearchContextComponent fieldsToFilter={['_id', 'firstName', 'lastName', 'job', 'invalidItemName']} items={allJobsAndUsersToDisplay}>
			<AssigneesListContainer onClick={handleOpen} className={className}>
				<AssigneesSelectMenu
					open={open}
					value={value ?? emptyValue}
					onClose={handleClose}
					onOpen={handleOpen}
					disabled={disabled}
					multiple={multiple}
					invalidValues={invalidValues}
					onChange={handleChange}
					{...props}
				/>
				{!listedAssignees.length && showEmptyText && (
					<FormattedMessage id="assignees.circleList.unassigned" defaultMessage="Unassigned" />
				)}
				{multiple ? (
					listedAssignees.map((assignee) => (
						<AssigneeCircle key={assignee} assignee={assignee} size="small" />
					))
				) : (
					<AssigneeCircle assignee={listedAssignees} size="small" />
				)}
				{overflowRequired && (
					<HoverPopover
						anchor={(attrs) => <ExtraAssigneesCircle {...attrs}> +{overflowValue} </ExtraAssigneesCircle>}
					>
						<ExtraAssigneesPopover assignees={value} />
					</HoverPopover>
				)}
				{!disabled && showAddButton && (
					<Tooltip
						title={formatMessage({
							id: 'customTicket.topPanel.addAssignees.tooltip',
							defaultMessage: 'Assign',
						})}
						arrow
					>
						<div>
							<AddUserButton>
								<AddUserIcon />
							</AddUserButton>
						</div>
					</Tooltip>
				)}
			</AssigneesListContainer>
		</SearchContextComponent>
	);
};
