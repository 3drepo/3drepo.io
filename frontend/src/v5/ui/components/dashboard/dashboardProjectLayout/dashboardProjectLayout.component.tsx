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

import { AppBar } from '@components/shared/appBar';
import { OuterContainer, InnerContainer } from './dashboardProjectLayout.styles';
import { ProjectsActionsDispatchers, TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { Outlet, useParams } from 'react-router-dom';
import { ProjectNavigation } from '@components/shared/navigationTabs';
import { DashboardFooter } from '@components/shared/dashboardFooter/dashboardFooter.component';
import { ProjectsHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { isEmpty } from 'lodash';

export const DashboardProjectLayout = (): JSX.Element => {
	const { teamspace, project } = useParams<DashboardParams>();
	const isFetchingAddons = TeamspacesHooksSelectors.selectIsFetchingAddons();
	const isFetchingProject = isEmpty(ProjectsHooksSelectors.selectCurrentProjectDetails());
	const isLoadingPermissions = isFetchingAddons || isFetchingProject;

	useEffect(() => {
		if (teamspace) {
			ProjectsActionsDispatchers.fetch(teamspace);
			TeamspacesActionsDispatchers.setCurrentTeamspace(teamspace);
		}
	}, [teamspace]);

	useEffect(() => {
		if (project) {
			ProjectsActionsDispatchers.setCurrentProject(project);
		}
	}, [project]);

	if (isLoadingPermissions) return;

	return (
		<>
			<AppBar />
			<ProjectNavigation />
			<OuterContainer>
				<InnerContainer>
					<Outlet />
				</InnerContainer>
				<DashboardFooter variant="light" />
			</OuterContainer>
		</>
	);
};
