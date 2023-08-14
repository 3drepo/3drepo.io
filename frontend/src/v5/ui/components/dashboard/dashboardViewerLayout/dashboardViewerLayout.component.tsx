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
import { ThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { theme } from '@/v5/ui/routes/viewer/theme';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AppBar } from '@components/shared/appBar';
import { TeamspacesActionsDispatchers, ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { Content } from './dashboardViewerLayout.styles';

export const DashboardViewerLayout = ({ children }) => {
	const { teamspace, project } = useParams<DashboardParams>();

	useEffect(() => {
		ProjectsActionsDispatchers.fetch(teamspace);
		TeamspacesActionsDispatchers.setCurrentTeamspace(teamspace);
		ProjectsActionsDispatchers.setCurrentProject(project);
	}, []);

	return (
		<>
			<AppBar />
			<Content>
				<ThemeProvider theme={theme}>
					<MuiThemeProvider theme={theme}>
						{children}
					</MuiThemeProvider>
				</ThemeProvider>
			</Content>
		</>
	);
};
