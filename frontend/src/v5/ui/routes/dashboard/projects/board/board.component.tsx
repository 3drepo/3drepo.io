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
import { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { ProjectsHooksSelectors, CurrentUserHooksSelectors, TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { TeamspacesActions } from '@/v4/modules/teamspaces';
import { Board as V4Board } from '@/v4/routes/board';
import { selectBoardDomain } from '@/v4/modules/board';
import { useNavigate, useLocation, useMatch } from 'react-router-dom';
import { UserManagementActions } from '@/v4/modules/userManagement';
import { Container } from './board.styles';

export const Board = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const match = useMatch('*');
	const dispatch = useDispatch();
	const board = useSelector(selectBoardDomain);
	const teamspace = TeamspacesHooksSelectors.selectCurrentTeamspace();
	const projectName = ProjectsHooksSelectors.selectCurrentProjectDetails()?.name;
	const username = CurrentUserHooksSelectors.selectUsername();

	const componentIsReady = username && projectName && board?.boardType;

	useEffect(() => {
		if (!componentIsReady) return;
		dispatch(UserManagementActions.fetchTeamspaceUsers());
		dispatch(TeamspacesActions.fetchTeamspacesIfNecessary(username));
	}, [projectName, username]);

	if (!componentIsReady) return (<></>);

	return (
		<Container>
			<V4Board
				currentTeamspace={teamspace}
				match={match}
				navigate={navigate}
				location={location}
				selectedRiskFilters={[]}
			/>
		</Container>
	);
};
