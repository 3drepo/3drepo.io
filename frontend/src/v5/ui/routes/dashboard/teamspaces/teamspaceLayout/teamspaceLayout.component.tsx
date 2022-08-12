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

import { ReactNode, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppBar } from '@components/shared/appBar';
import { TeamspacesActionsDispatchers } from '@/v5/services/actionsDispatchers/teamspacesActions.dispatchers';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers/projectsActions.dispatchers';
import { TeamspaceNavigation } from '@components/shared/navigationTabs/teamspaceNavigation/teamspaceNavigation.component';
import { TeamspaceParams } from '@/v5/ui/routes/routes.constants';
import { DEFAULT_TEAMSPACE_IMG_SRC, getTeamspaceImgSrc } from '@/v5/store/teamspaces/teamspaces.helpers';
import { CurrentUserHooksSelectors } from '@/v5/services/selectorsHooks/currentUserSelectors.hooks';
import { Container, Content, TopBar, TeamspaceImage } from './teamspaceLayout.styles';
import { TeamspaceInfo } from './teamspaceInfo.component';

interface ITeamspaceLayout {
	children: ReactNode;
	className?: string;
}

export const TeamspaceLayout = ({ children, className }: ITeamspaceLayout): JSX.Element => {
	const { teamspace } = useParams<TeamspaceParams>();
	const currentUserIsUpating = CurrentUserHooksSelectors.selectPersonalDataIsUpdating();

	const [imgSrc, setImgSrc] = useState(null);

	const updateImg = () => setImgSrc(getTeamspaceImgSrc(teamspace));

	useEffect(() => {
		if (teamspace) {
			ProjectsActionsDispatchers.fetch(teamspace);
			TeamspacesActionsDispatchers.setCurrentTeamspace(teamspace);
			updateImg();
		}
	}, [teamspace]);

	useEffect(() => { if (!currentUserIsUpating) updateImg(); }, [currentUserIsUpating]);

	return (
		<Container className={className}>
			<AppBar />
			<TopBar>
				<TeamspaceImage imgSrc={imgSrc} defaultImgSrc={DEFAULT_TEAMSPACE_IMG_SRC} />
				<TeamspaceInfo />
			</TopBar>
			<TeamspaceNavigation />
			<Content>
				{children}
			</Content>
		</Container>
	);
};
