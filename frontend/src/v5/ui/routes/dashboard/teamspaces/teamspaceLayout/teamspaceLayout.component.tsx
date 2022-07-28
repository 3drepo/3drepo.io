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
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers/projectsActions.dispatchers';
import { TeamspaceNavigation } from '@components/shared/navigationTabs/teamspaceNavigation/teamspaceNavigation.component';
import { FormattedMessage } from 'react-intl';
import { TeamspaceParams } from '@/v5/ui/routes/routes.constants';
import { generateV5ApiUrl } from '@/v5/services/api/default';
import { clientConfigService } from '@/v4/services/clientConfig';
import { Container, Content, TopBar, TeamspaceInfo, TeamspaceName, TeamspaceImage } from './teamspaceLayout.styles';

interface ITeamspaceLayout {
	children: ReactNode;
	className?: string;
}

export const TeamspaceLayout = ({ children, className }: ITeamspaceLayout): JSX.Element => {
	const { teamspace } = useParams<TeamspaceParams>();
	const DEFAULT_TEAMSPACE_IMG_SRC = 'assets/images/teamspace_placeholder.svg';
	const teamspaceImgSrc = generateV5ApiUrl(`teamspaces/${teamspace.name}/avatar?${Date.now()}`, clientConfigService.GET_API);

	useEffect(() => {
		if (teamspace) {
			ProjectsActionsDispatchers.fetch(teamspace);
			TeamspacesActionsDispatchers.setCurrentTeamspace(teamspace);
		}
	}, [teamspace]);

	return (
		<Container className={className}>
			<AppBar />
			<TopBar>
				<TeamspaceImage imgSrc={teamspaceImgSrc} defaultImgSrc={DEFAULT_TEAMSPACE_IMG_SRC} />
				<TeamspaceInfo>
					<TeamspaceName>
						<FormattedMessage
							id="teamspace.definition"
							defaultMessage="{teamspace} Teamspace"
							values={{ teamspace }}
						/>
					</TeamspaceName>
				</TeamspaceInfo>
			</TopBar>
			<TeamspaceNavigation />
			<Content>
				{children}
			</Content>
		</Container>
	);
};
