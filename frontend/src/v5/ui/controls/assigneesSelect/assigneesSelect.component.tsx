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
import { uniq } from 'lodash';

export type AssigneesSelectProps = Pick<FormInputProps, 'value'> & SelectProps & {
	maxItems?: number;
	showAddButton?: boolean;
	showEmptyText?: boolean;
	onBlur?: () => void;
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
	...props
}: AssigneesSelectProps) => {
	const [open, setOpen] = useState(false);
	const { containerOrFederation } = useContext(TicketContext);

	const teamspaceJobsAndUsers = UsersHooksSelectors.selectJobsAndUsers();
	
	const isFed = modelIsFederation(containerOrFederation);

	const users = isFed
		? FederationsHooksSelectors.selectFederationUsers(containerOrFederation)
		: ContainersHooksSelectors.selectContainerUsers(containerOrFederation);

	const jobs = isFed
		? FederationsHooksSelectors.selectFederationJobs(containerOrFederation)
		: ContainersHooksSelectors.selectContainerJobs(containerOrFederation);
	
	const emptyValue = multiple ? [] : '';
	const value = valueRaw || emptyValue;
	const getInvalidJobsAndUsersInValue = useCallback(() => {
		const jobsAndUsersNotValidForModel = [], jobsAndUsersNotFound = [];
		(multiple ? value : [value]).forEach((val) => {
			const jobOrUser = teamspaceJobsAndUsers.find((ju) => (ju._id || ju.user) === val);
			if (!jobOrUser) {
				jobsAndUsersNotFound.push(val);
				return;
			}
			const valueExistsForModel = !!(users.find((user) => user === jobOrUser) || jobs.find((job) => job === jobOrUser));
			if (!valueExistsForModel) {
				jobsAndUsersNotValidForModel.push(jobOrUser);
			}
		});
		return { jobsAndUsersNotValidForModel, jobsAndUsersNotFound };
	}, [value, users, jobs]);
	const { jobsAndUsersNotFound, jobsAndUsersNotValidForModel } = getInvalidJobsAndUsersInValue();
	
	const allJobsAndUsers = uniq([...users, ...jobs, ...jobsAndUsersNotValidForModel].filter(Boolean));
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

	return (
		<SearchContextComponent fieldsToFilter={['_id', 'firstName', 'lastName', 'job']} items={allJobsAndUsers}>
			<AssigneesListContainer onClick={handleOpen} className={className}>
				<AssigneesSelectMenu
					open={open}
					value={value ?? emptyValue}
					onClose={handleClose}
					onOpen={handleOpen}
					disabled={disabled}
					multiple={multiple}
					jobsAndUsersNotFound={jobsAndUsersNotFound}
					jobsAndUsersNotValidForModel={jobsAndUsersNotValidForModel}
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
