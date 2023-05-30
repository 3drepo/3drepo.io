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
import { FormattedMessage } from 'react-intl';
import { useCallback, useState } from 'react';
import { SelectProps } from '@controls/inputs/select/select.component';
import { formatMessage } from '@/v5/services/intl';
import AddUserIcon from '@assets/icons/outlined/add_user-outlined.svg';
import { SearchContextComponent } from '@controls/search/searchContext';
import { AddUserButton, AssigneesListContainer, Tooltip } from './assigneesSelect.styles';
import { AssigneesSelectMenu } from './assigneesSelectMenu/assigneesSelectMenu.component';
import { AssigneeCircle } from './assigneeCircle/assigneeCircle.component';

export type IAssigneesSingleSelect = SelectProps & {
	maxItems?: number;
	showAddButton?: boolean;
	showEmptyText?: boolean;
};

export const AssigneesSingleSelect = ({
	value,
	showAddButton = false,
	showEmptyText = false,
	disabled,
	onBlur,
	className,
	...props
}: IAssigneesSingleSelect) => {
	const [open, setOpen] = useState(false);

	// Must filter out users not included in this teamspace. This can occur when a user
	// has been assigned to a ticket and later on is removed from the teamspace
	const allUsersAndJobs = UsersHooksSelectors.selectUsersAndJobs();
	// eslint-disable-next-line max-len
	const userIsValid = allUsersAndJobs.some(({ _id, user }) => [_id, user].includes(value)) ?? '';

	const handleOpen = useCallback((e) => {
		if (disabled) return;
		e.stopPropagation();
		setOpen(true);
	}, []);

	const handleClose = () => {
		onBlur();
		setOpen(false);
	};

	const filterItems = useCallback((items, query: string) => items
		.filter(({ _id, firstName, lastName, job }) => [_id, firstName, lastName, job]
			.some((string) => string?.toLowerCase().includes(query.toLowerCase()))), []);

	return (
		<SearchContextComponent filteringFunction={filterItems} items={allUsersAndJobs}>
			<AssigneesListContainer onClick={handleOpen} className={className}>
				<AssigneesSelectMenu
					open={open}
					value={userIsValid ? value : ''}
					onClose={handleClose}
					onOpen={handleOpen}
					disabled={disabled}
					{...props}
					multiple={false}
				/>
				{value ? (
					<AssigneeCircle assignee={value} size="small" />
				) : showEmptyText && (
					<FormattedMessage id="assignees.circleList.unassigned" defaultMessage="Unassigned" />
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
