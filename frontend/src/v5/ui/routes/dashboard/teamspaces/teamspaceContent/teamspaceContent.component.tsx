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

import { useMatch, Navigate, Routes } from 'react-router-dom';
import { formatMessage } from '@/v5/services/intl';
import { Route } from '@/v5/services/routing/route.component';
import { NOT_FOUND_ROUTE_PATH } from '@/v5/ui/routes/routes.constants';
import { discardSlash } from '@/v5/helpers/url.helper';
import { useEffect } from 'react';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { ProjectsList } from '../projects/projectsList.component';
import { TeamspaceSettings } from '../settings/teamspaceSettings.component';
import { UsersList } from '../users/usersList.component';
import { Jobs } from '../jobs/jobs.component';

export const TeamspaceContent = () => {
	let path = useMatch('*');
	path = discardSlash(path);

	useEffect(() => { ProjectsActionsDispatchers.setCurrentProject(''); }, []);

	return (
		<Routes>
			<Route title={formatMessage({ id: 'pageTitle.teamspace.projects', defaultMessage: ':teamspace - Projects' })} path={`${path}/t/projects`} element={<ProjectsList />}/>
			<Route title={formatMessage({ id: 'pageTitle.teamspace.jobs', defaultMessage: ':teamspace - Jobs' })} path={`${path}/t/jobs`} element={<Jobs />} />
			<Route title={formatMessage({ id: 'pageTitle.teamspace.settings', defaultMessage: ':teamspace - Settings' })} path={`${path}/t/settings`} element={<TeamspaceSettings />} />
			<Route title={formatMessage({ id: 'pageTitle.teamspace.users', defaultMessage: ':teamspace - Users' })} path={`${path}/t/users`} element={<UsersList />} />
			<Route path="*" element={<Navigate to={NOT_FOUND_ROUTE_PATH} />} />
		</Routes>
	);
};
