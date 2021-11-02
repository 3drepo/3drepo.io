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

import { discardSlash, discardUrlComponent } from '@/v5/services/routing/routing';
import { useRouteMatch, useParams } from 'react-router-dom';

import { Trans } from '@lingui/react';
import React from 'react';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { IProject } from '@/v5/store/projects/projects.redux';
import { Container, Link } from './topNavigaton.styles';

export const TopNavigation = (): JSX.Element => {
	let { url } = useRouteMatch();
	url = discardSlash(url);

	const { project } = useParams();
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();
	const hasValidProject = Boolean(projects.find(({ _id }) => _id === project));

	return (
		<Container>
			{hasValidProject
			&& (
				<>
					<Link to={`${url}/t/federations`}><Trans id="Federations" /></Link>
					<Link to={`${url}/t/containers`}><Trans id="Containers" /></Link>
					<Link to={`${discardUrlComponent(url, 'settings')}/t/settings`}><Trans id="Settings" /></Link>
				</>
			)}
		</Container>
	);
};
