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

import { ReactNode, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppBar } from '@components/shared/appBar';
import { TeamspacesActionsDispatchers, ProjectsActionsDispatchers, UsersActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { TeamspaceNavigation } from '@components/shared/navigationTabs/teamspaceNavigation/teamspaceNavigation.component';
import { TeamspaceParams } from '@/v5/ui/routes/routes.constants';
import { DEFAULT_TEAMSPACE_IMG_SRC, getTeamspaceImgSrc } from '@/v5/store/teamspaces/teamspaces.helpers';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import { DashboardFooter } from '@components/shared/dashboardFooter';
import { DashboardScrollArea } from '@controls/scrollArea/dashboardScrollArea.styles';
import { Container, TopBar, TeamspaceImage, TeamspaceInfo, Content } from './teamspaceLayout.styles';
import { TeamspaceQuota } from './teamspaceQuota/teamspaceQuota.component';

interface ITeamspaceLayout {
	children: ReactNode;
	className?: string;
}

export const TeamspaceLayout = ({ children, className }: ITeamspaceLayout): JSX.Element => {
	const { teamspace } = useParams<TeamspaceParams>();
	const isAdmin = TeamspacesHooksSelectors.selectIsTeamspaceAdmin();
	

	useEffect(() => {
		if (teamspace) {
			ProjectsActionsDispatchers.fetch(teamspace);
			TeamspacesActionsDispatchers.setCurrentTeamspace(teamspace);
			UsersActionsDispatchers.fetchUsers(teamspace);
		}
	}, [teamspace]);

	return (
		<Container className={className}>
			<AppBar />
			<TopBar>
				<TeamspaceImage imgSrc={getTeamspaceImgSrc(teamspace)} defaultImgSrc={DEFAULT_TEAMSPACE_IMG_SRC} />
				<TeamspaceInfo>
					<Typography variant="h1">
						<FormattedMessage
							id="teamspace.info.name"
							defaultMessage="{teamspace} Teamspace"
							values={{ teamspace }}
						/>
					</Typography>
					{isAdmin && <TeamspaceQuota />}
				</TeamspaceInfo>
			</TopBar>
			<TeamspaceNavigation />
			<DashboardScrollArea>
				<Content>
					{children}
				</Content>
				<DashboardFooter variant="light" />
			</DashboardScrollArea>
		</Container>
	);
};
