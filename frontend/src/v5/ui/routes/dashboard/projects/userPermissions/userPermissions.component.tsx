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

import { ProjectsPermissions as V4ProjectsPermissions } from '@/v4/routes/projects/projectsPermissions';
import { useDispatch } from 'react-redux';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { Button } from '@material-ui/core';

enum TABS {
	PROJECT,
	FEDERATIONS_AND_CONTAINERS,
}

export const UsersPermissions = () => {
	const dispatch = useDispatch();
	const projectName = ProjectsHooksSelectors.selectCurrentProjectDetails().name;
	const [selectedTab, setSelectedTab] = useState(TABS.PROJECT);

	const onClickTab = (tab) => () => setSelectedTab(tab);

	useEffect(() => {
		dispatch(UserManagementActions.fetchTeamspaceUsers());
		dispatch(UserManagementActions.fetchProject(projectName));
	});

	return (
		<>
			<Button onClick={onClickTab(TABS.PROJECT)}>
				Project Permissions
			</Button>
			<Button onClick={onClickTab(TABS.FEDERATIONS_AND_CONTAINERS)}>
				Container & Federation permissions
			</Button>
			{selectedTab === TABS.PROJECT && <V4ProjectsPermissions />}
			{selectedTab === TABS.FEDERATIONS_AND_CONTAINERS && <>Containers stuff</>}
		</>
	);
};
