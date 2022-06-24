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

import { discardSlash } from '@/v5/services/routing/routing';
import { useRouteMatch, Route, Switch, Redirect, useParams } from 'react-router-dom';
import { ScrollArea } from '@controls/scrollArea';
import { TeamspaceNavigation } from '@components/shared/teamspaceNavigation/teamspaceNavigation.component';
import { FormattedMessage } from 'react-intl';
import { DashboardParams } from '@/v5/ui/routes/routes.constants';
import { NOT_FOUND_ROUTE_PATH } from '../../routes.constants';
import { TopBar, TeamspaceInfo, TeamspaceName } from './teampsace.styles';
import { ProjectsList } from './projects/projectsList.component';

export const TeamspaceContent = () => {
	let { path } = useRouteMatch();
	path = discardSlash(path);
	
	const { teamspace } = useParams<DashboardParams>();

	return (
		<>
			<TopBar>
				{/* TODO change to use avatar */}
				<img height="142" width="142" src="https://upload.wikimedia.org/wikipedia/commons/c/c7/General_Conference.jpg" />
				<TeamspaceInfo>
					<TeamspaceName>
						{teamspace} <FormattedMessage id="teamspace.definition" defaultMessage="Teamspace" />
					</TeamspaceName>
				</TeamspaceInfo>
			</TopBar>
			<TeamspaceNavigation />
			<ScrollArea variant="base" autoHide>
				<Switch>
					<Route exact path={`${path}/t/projects`}>
						<ProjectsList />
					</Route>
					<Route exact path={`${path}/t/settings`}>
						Settings
					</Route>
					<Route exact path={`${path}/t/users`}>
						Users
					</Route>
					<Route exact path={`${path}/t/jobs`}>
						Jobs
					</Route>
					<Route path="*">
						<Redirect to={NOT_FOUND_ROUTE_PATH} />
					</Route>
				</Switch>
			</ScrollArea>
		</>
	);
};
