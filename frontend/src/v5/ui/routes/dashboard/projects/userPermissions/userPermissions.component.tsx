/**
 *  Copyright (C) 2021 3D Repo Ltd
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
import { useEffect } from 'react';
import { UserManagementActions } from '@/v4/modules/userManagement';

import { useDispatch } from 'react-redux';
import { ProjectsHooksSelectors, CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks';
import { TeamspacesActions } from '@/v4/modules/teamspaces';
import { Container, V4ModelsPermissions } from './userPermissions.styles';
import { SuppressPermissionModalToggle } from '@components/shared/updatePermissionModal/suppressPermissionModalToggle.component';
import { useLocation } from 'react-router-dom';

export const UserPermissions = () => {
	const location = useLocation();
	const dispatch = useDispatch();
	const projectName = ProjectsHooksSelectors.selectCurrentProjectDetails()?.name;
	const username = CurrentUserHooksSelectors.selectUsername();
	useEffect(() => {
		if (!username || !projectName) {
			return;
		}

		dispatch(UserManagementActions.fetchTeamspaceUsers());
		dispatch(UserManagementActions.fetchProject(projectName));
		dispatch(TeamspacesActions.fetchTeamspacesIfNecessary(username));
	}, [projectName, username]);

	if (!username || !projectName) {
		return (<></>);
	}

	return (
		<Container>
			<SuppressPermissionModalToggle />
			<V4ModelsPermissions location={location} />
		</Container>
	);
};
