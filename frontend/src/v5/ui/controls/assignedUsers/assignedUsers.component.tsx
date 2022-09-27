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

import { Popover } from '@/v4/routes/components/messagesList/components/message/components/markdownMessage/ticketReference/ticketReference.styles';
import { IUser } from '@/v5/store/users/users.redux';
import { UserPopover } from '@components/shared/userPopover/userPopover.component';
import { useState } from 'react';
import { AssignedUsersList, ExtraUsersCircle, UserCircle, WhiteOverlay } from './assignedUsers.styles';
import { ExtraUsersPopover } from './extraUsersPopover/extraUsersPopover.component';

type AssignedUsersType = {
	users: IUser[];
	max?: number
};

export const AssignedUsers = ({ users, max }: AssignedUsersType) => {
	const [anchorEl, setAnchorEl] = useState<Element | null>(null);
	const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

	const handlePopoverOpen = (event: React.MouseEvent<Element, MouseEvent>, user = null) => {
		setAnchorEl(event.currentTarget);
		setSelectedUser(user);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	let displayedUsers = [...users];
	let extraUsers = [];
	if (max && users.length > max) {
		displayedUsers = users.slice(0, max - 1);
		extraUsers = users.slice(max - 1);
	}
	return (
		<AssignedUsersList>
			<WhiteOverlay />
			{displayedUsers.map((user, index) => (
				<UserCircle
					key={user.user}
					user={user}
					index={index}
					size="small"
					onMouseEnter={(e) => handlePopoverOpen(e, user)}
					onMouseLeave={handlePopoverClose}
				/>
			))}
			{extraUsers.length && (
				<ExtraUsersCircle
					onMouseEnter={(e) => handlePopoverOpen(e, null)}
					onMouseLeave={handlePopoverClose}
				>
					+{extraUsers.length}
				</ExtraUsersCircle>
			)}
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
					? <UserPopover user={selectedUser} /> : <ExtraUsersPopover users={extraUsers} />}
			</Popover>
		</AssignedUsersList>
	);
};
