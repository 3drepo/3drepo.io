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
import { Container, Link } from './topNavigaton.styles';

const LINKS = [{
	title: 'Federations',
	to: '#federations',
	active: true,
}, {
	title: 'Containers',
	to: '#container',
}, {
	title: 'Tasks',
	to: '#tasks',
}, {
	title: 'Users',
	to: '#users',
}, {
	title: 'Settings',
	to: '#settings',
	disabled: true,
}];

export const TopNavigation = (): JSX.Element => (
	<Container>
		{LINKS.map(({ title, to, ...props }) => (
			<Link to={to} {...props}>{title}</Link>
		))}
	</Container>
);
