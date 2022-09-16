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

import { IUser } from '@/v5/store/users/users.redux';
import { AssignedUsersList, ExtraUsersCircle, UserCircle, WhiteOverlay } from './assignedUsers.styles';

type AssignedUsersType = {
	users: IUser[];
	max?: number
};

export const AssignedUsers = ({ users, max }: AssignedUsersType) => {
	let displayedUsers = [...users];
	let extraUsers = [];
	if (max && users.length > max) {
		displayedUsers = users.slice(0, max - 1);
		extraUsers = users.slice(max - 1);
	}
	return (
		<AssignedUsersList>
			<WhiteOverlay />
			{displayedUsers.map((user, index) => <UserCircle user={user} index={index} size="small" />)}
			{extraUsers.length && (
				<ExtraUsersCircle>
					+{extraUsers.length}
				</ExtraUsersCircle>
			)}
		</AssignedUsersList>
	);
};
