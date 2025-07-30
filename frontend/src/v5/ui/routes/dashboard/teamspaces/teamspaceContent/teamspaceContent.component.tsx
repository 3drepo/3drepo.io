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

import { Navigate, Routes, Route } from 'react-router-dom';
import { formatMessage } from '@/v5/services/intl';
import { NOT_FOUND_ROUTE_PATH } from '@/v5/ui/routes/routes.constants';
import { useEffect } from 'react';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectsList } from '../projects/projectsList.component';
import { TeamspaceSettings } from '../settings/teamspaceSettings.component';
import { UsersList } from '../users/usersList.component';
import { Jobs } from '../jobs/jobs.component';
import { RouteTitle } from '@/v5/services/routing/routeTitle.component';

export const TeamspaceContent = () => {
	useEffect(() => { ProjectsActionsDispatchers.setCurrentProject(''); }, []);

	return (
		<Routes>
			<Route path="t">
				<Route index element={<Navigate to="/projects" replace />} />
				<Route path={'projects'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.projects', defaultMessage: ':teamspace - Projects' })}><ProjectsList /></RouteTitle>} />
				<Route path={'jobs'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.jobs', defaultMessage: ':teamspace - Jobs' })}><Jobs /></RouteTitle>} />
				<Route path={'settings'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.settings', defaultMessage: ':teamspace - Settings' })}><TeamspaceSettings /></RouteTitle>} />
				<Route path={'users'} element={<RouteTitle title={formatMessage({ id: 'pageTitle.teamspace.users', defaultMessage: ':teamspace - Users' })}><UsersList /></RouteTitle>} />
				<Route path="*" element={<Navigate to={NOT_FOUND_ROUTE_PATH} />} />
			</Route>
			<Route index element={<Navigate to="/t/projects" replace />} />
		</Routes>
	);
};
