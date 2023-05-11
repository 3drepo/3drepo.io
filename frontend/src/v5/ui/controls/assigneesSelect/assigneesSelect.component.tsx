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
import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { intersection } from 'lodash';
import { FormattedMessage } from 'react-intl';
import { useCallback, useState } from 'react';
import { SelectProps } from '@controls/inputs/select/select.component';
import { formatMessage } from '@/v5/services/intl';
import AddUserIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { AddUserButton, AssigneesListContainer, Tooltip } from './assigneesSelect.styles';
import { AssigneesSelectMenu } from './assigneesSelectMenu/assigneesSelectMenu.component';
import { AssigneeCircle } from './assigneeCircle/assigneeCircle.component';
import { ExtraAssigneesCircle } from './extraAssigneesCircle/extraAssigneesCircle.component';
import { ExtraAssigneesPopover } from './extraAssigneesCircle/extraAssigneesPopover.component';

export type IAssigneesSelect = SelectProps & {
	maxItems?: number;
	showAddButton?: boolean;
	showEmptyText?: boolean;
};

export const AssigneesSelect = ({
	value,
	maxItems = 3,
	showAddButton = false,
	showEmptyText = false,
	disabled,
	onBlur,
	className,
	...props
}: IAssigneesSelect) => {
	const [open, setOpen] = useState(false);

	// Must filter out users not included in this teamspace. This can occur when a user
	// has been assigned to a ticket and later on is removed from the teamspace
	const allUsersAndJobs = UsersHooksSelectors.selectAssigneesListItems();
	const filteredValues = intersection(value, allUsersAndJobs.map((i) => i.value));

	// Using this logic instead of a simple partition because ExtraAssigneesCircle needs to occupy
	// the last position when the overflow value is 2+. There is no point showing +1 overflow
	// since the overflowing assignee could just be displayed instead
	const overflowRequired = filteredValues.length > maxItems;
	const listedAssignees = overflowRequired ? filteredValues.slice(0, maxItems - 1) : filteredValues;
	const overflowValue = overflowRequired ? filteredValues.slice(maxItems - 1).length : 0;

	const handleOpen = useCallback((e) => {
		if (disabled) return;
		e.stopPropagation();
		setOpen(true);
	}, []);
	const handleClose = useCallback(() => {
		setOpen(false);
		onBlur();
	}, []);

	return (
		<AssigneesListContainer onClick={handleOpen} className={className}>
			<AssigneesSelectMenu
				open={open}
				value={filteredValues}
				onClose={handleClose}
				onOpen={handleOpen}
				disabled={disabled}
				{...props}
			/>
			{listedAssignees.length ? (
				listedAssignees.map((assignee) => (
					<AssigneeCircle key={assignee} assignee={assignee} size="small" />
				))
			) : showEmptyText && (
				<FormattedMessage id="assignees.circleList.unassigned" defaultMessage="Unassigned" />
			)}
			{overflowRequired && (
				<HoverPopover
					anchor={(extraProps) => <ExtraAssigneesCircle overflowValue={overflowValue} {...extraProps} />}
				>
					<ExtraAssigneesPopover assignees={filteredValues} />
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
	);
};
