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

import React from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';

import { ROUTES, getRouteLink } from '@/v5/services/routes/routes';
import { Container, Link } from './topNavigaton.styles';

export const TopNavigation = (): JSX.Element => {
	const { teamspace, project } = useParams();
	const isProjectSelected = !!project;

	const links = [{
		title: 'Federations',
		to: getRouteLink({ route: ROUTES.FEDERATIONS, teamspace, project }),
		active: useRouteMatch(ROUTES.FEDERATIONS),
		disabled: !isProjectSelected,
	}, {
		title: 'Containers',
		to: getRouteLink({ route: ROUTES.CONTAINERS, teamspace, project }),
		active: useRouteMatch(ROUTES.CONTAINERS),
		disabled: !isProjectSelected,
	}, {
		title: 'Tasks',
		to: getRouteLink({ route: ROUTES.TASKS, teamspace, project }),
		active: useRouteMatch(ROUTES.TASKS),
	}, {
		title: 'Users',
		to: getRouteLink({ route: ROUTES.USERS, teamspace, project }),
		active: useRouteMatch(ROUTES.USERS),
	}, {
		title: 'Settings',
		to: getRouteLink({ route: ROUTES.SETTINGS, teamspace, project }),
		active: useRouteMatch(ROUTES.SETTINGS),
	}].filter(({ disabled }) => !disabled);

	return (
		<Container>
			{links.map(({ title, to, ...props }) => (
				<Link to={to} {...props}>{title}</Link>
			))}
		</Container>
	);
};
