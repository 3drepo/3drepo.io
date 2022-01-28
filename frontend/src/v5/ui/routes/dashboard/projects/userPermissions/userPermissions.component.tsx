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
import React, { useEffect, useState } from 'react';
import { UserManagementActions } from '@/v4/modules/userManagement';

import { useDispatch, useSelector } from 'react-redux';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { TeamspacesActions } from '@/v4/modules/teamspaces';
import { selectCurrentUser } from '@/v4/modules/currentUser';
import { FixedOrGrowContainer } from '@controls/fixedOrGrowContainer';
import { formatMessage } from '@/v5/services/intl';
import { Container, Tab, Tabs, V4ModelsPermissions, V4ProjectsPermissions } from './userPermissions.styles';

export const UsersPermissions = () => {
	const dispatch = useDispatch();
	const projectName = ProjectsHooksSelectors.selectCurrentProjectDetails().name;
	const username = useSelector(selectCurrentUser)?.username;

	const [selectedTab, setSelectedTab] = useState(0);

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

	const handleChange = (event, newValue) => {
		setSelectedTab(newValue);
	};

	return (
		<Container>
			<Tabs value={selectedTab} onChange={handleChange}>
				<Tab label={formatMessage({ id: 'usersPermissions.projectPermissions', defaultMessage: 'Project Permissions' })} />
				<Tab label={formatMessage({ id: 'usersPermissions.contAndFedPermissions', defaultMessage: 'Container & Federation permissions' })} />
			</Tabs>
			<FixedOrGrowContainer>
				{selectedTab === 0 && <V4ProjectsPermissions />}
				{selectedTab === 1 && <V4ModelsPermissions />}
			</FixedOrGrowContainer>
		</Container>
	);
};
