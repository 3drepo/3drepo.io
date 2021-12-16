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

import React from 'react';
import { useParams } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import {
	DashboardList,
	DashboardListEmptyContainer,
} from '@components/dashboard/dashboardList';
import { IProject } from '@/v5/store/projects/projects.redux';
import { ProjectListItem } from '@/v5/ui/routes/dashboard/projects/projectsList/projectListItem/projectListItem.component';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers/projectsActions.dispatchers';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { Container } from './projectsList.styles';

export const ProjectList = (): JSX.Element => {
	const { teamspace } = useParams();

	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();

	React.useEffect(() => {
		if (teamspace) ProjectsActionsDispatchers.fetch(teamspace);
	}, [teamspace]);

	return (
		<Container>
			<DashboardList>
				<FormattedMessage id="dashboard.projectsList.header" defaultMessage="Projects" />
				{
					projects.length ? (
						projects.map((project) => <ProjectListItem
								key={project._id}
								projectId={project._id}
								name={project.name}
							/>
						)
					) : (
						<DashboardListEmptyContainer>
							<FormattedMessage
								id="dashboard.projectsList.emptyList"
								defaultMessage="No projects found"
							/>
						</DashboardListEmptyContainer>
					)
				}
			</DashboardList>
		</Container>
	);
};
