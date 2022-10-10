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
import { useParams } from 'react-router-dom';
import { IUser } from '@/v5/store/users/users.redux';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { UsersActionsDispatchers } from '@/v5/services/actionsDispatchers/usersAction.dispatchers';
import Popover from '@mui/material/Popover';
import { AssigneesList, ExtraAssigneesCircle } from './assignees.styles';
import { ExtraAssigneesPopover } from './extraAssigneesPopover/extraAssigneesPopover.component';
import { AssigneeCircle } from './assigneeCircle/assigneeCircle.component';
import { DashboardParams } from '../../routes/routes.constants';

type AssigneesType = {
	assignees: string[];
	max?: number;
	className?: string;
};

export const Assignees = ({ assignees = [], max, className }: AssigneesType) => {
	const { teamspace } = useParams<DashboardParams>();
	const [anchorEl, setAnchorEl] = useState<Element | null>(null);
	const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

	const handlePopoverOpen = (event: React.MouseEvent<Element, MouseEvent>, user = null) => {
		setAnchorEl(event.currentTarget);
		setSelectedUser(user);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	UsersActionsDispatchers.fetchUsers(teamspace);

	let displayedAssignees = assignees ?? [];
	let extraAssignees = [];
	if (max && assignees.length > max) {
		displayedAssignees = assignees.slice(0, max - 1);
		extraAssignees = assignees.slice(max - 1);
	}

	return (
		<AssigneesList className={className}>
			{assignees.length && displayedAssignees.length ? (
				displayedAssignees.map((assignee) => (
					<AssigneeCircle
						key={assignee}
						assignee={assignee}
						onMouseEnter={(e) => handlePopoverOpen(e, null)}
						onMouseLeave={handlePopoverClose}
					/>
				))
			) : (
				<FormattedMessage id="assignedAssignees.unassigned" defaultMessage="Unassigned" />
			)}
			{extraAssignees.length ? (
				<ExtraAssigneesCircle
					onMouseEnter={(e) => handlePopoverOpen(e, null)}
					onMouseLeave={handlePopoverClose}
				>
					+{extraAssignees.length}
				</ExtraAssigneesCircle>
			) : <></>}
			<Popover
				id="mouse-over-popover"
				open={!!anchorEl}
				anchorEl={anchorEl}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				onClose={handlePopoverClose}
				disableRestoreFocus
			>
				{selectedUser
					? <UserPopover user={selectedUser} /> : <ExtraAssigneesPopover assignees={extraAssignees} />}
			</Popover>
		</AssigneesList>
	);
};
