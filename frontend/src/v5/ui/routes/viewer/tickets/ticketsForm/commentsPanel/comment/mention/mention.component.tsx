/**
 *  Copyright (C) 2026 3D Repo Ltd
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

/**
 *  Copyright (C) 2026 3D Repo Ltd
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { HoverPopover } from '@controls/hoverPopover/hoverPopover.component';
import { UserPopover } from '@components/shared/popoverCircles/userPopoverCircle/userPopover/userPopover.component';
import { IUser } from '@/v5/store/users/users.redux';
import styled from 'styled-components';

const MentionText = styled.span`
	color: ${({ theme }) => theme.palette.primary.main};
	cursor: pointer;
`;

type MentionProps = {
	userId: string;
};

const USERS: IUser[] = [
	{ user: '1', firstName: 'Alice', lastName: 'Smith', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '2', firstName: 'Bob', lastName: 'Jones', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '3', firstName: 'Charlie', lastName: 'Brown', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '4', firstName: 'David', lastName: 'Wilson', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '5', firstName: 'Sanmont', lastName: '3D', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '6', firstName: 'Mosment', lastName: 'Taylor', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '7', firstName: 'Grace', lastName: 'Davis', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '8', firstName: 'Hannah', lastName: 'Moore', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '9', firstName: 'Ian', lastName: 'Thomas', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
	{ user: '10', firstName: 'Julia', lastName: 'Evans', company: '3D Repo', job: 'Engineer', avatarUrl: '', hasAvatar: false },
];

export const Mention = ({ userId }: MentionProps) => {
	const user = USERS.find(({ user: id }) => id === userId);

	if (!user) return <span>@{userId}</span>;

	return (
		<HoverPopover anchor={() => <MentionText>{user.firstName} {user.lastName}</MentionText>}>
			<UserPopover user={user} />
		</HoverPopover>
	);
};
