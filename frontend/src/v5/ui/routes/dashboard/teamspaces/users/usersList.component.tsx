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

import { UserManagementActions } from '@/v4/modules/userManagement';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Users as V4UsersList } from '@/v4/routes/users';
import { TeamspacesActions } from '@/v4/modules/teamspaces';
import { CurrentUserHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { V5UserListOverrides } from '@/v5/ui/v4Adapter/overrides/userList.overrides';
import { Header, Title } from '../projects/projectsList.styles';
import { UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';

export const UsersList = () => {
	const dispatch = useDispatch();
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const username = CurrentUserHooksSelectors.selectUsername();
	const parentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!teamspace) return;

		UsersActionsDispatchers.fetchUsers(teamspace); // V5
		dispatch(UserManagementActions.fetchTeamspaceUsers()); // V4
		dispatch(TeamspacesActions.fetchTeamspacesIfNecessary(username));
	}, [teamspace, username]);

	return (
		<V5UserListOverrides ref={parentRef}>
			<Header>
				<Title>
					<FormattedMessage id="usersList.title" defaultMessage="Users" />
				</Title>
			</Header>
			<V4UsersList parentRef={parentRef} />
		</V5UserListOverrides>
	);
};
