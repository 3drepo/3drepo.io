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

import { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AppBar } from '@components/shared/appBar';
import { Header as ProjectHeader } from '@/v5/ui/routes/dashboard/projects/header';
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers/projectsActions.dispatchers';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { Container, Content } from './dashboardLayout.styles';

interface IDashboardLayout {
	children: ReactNode;
	className?: string;
}

export const DashboardLayout = ({ children, className }: IDashboardLayout): JSX.Element => {
	const { teamspace, project, containerOrFederation } = useParams<DashboardParams>();

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

	return (
		<Container className={className}>
			<AppBar />
			{project && !containerOrFederation && <ProjectHeader />}
			<Content>
				{children}
			</Content>
		</Container>
	);
};
