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
import { useRouteMatch } from 'react-router-dom';
import { discardSlash, discardUrlComponent } from '@/v5/services/routing/routing';
import { FormattedMessage } from 'react-intl';
import { Container, Link } from './projectNavigaton.styles';

export const ProjectNavigation = (): JSX.Element => {
	let { url } = useRouteMatch();
	url = discardSlash(url);

	return (
		<Container>
			<Link to={`${url}/t/federations`}><FormattedMessage id="projectNavigation.federations" defaultMessage="Federations" /></Link>
			<Link to={`${url}/t/containers`}><FormattedMessage id="projectNavigation.containers" defaultMessage="Containers" /></Link>
			<Link to={`${discardUrlComponent(url, 'settings')}/t/settings`}><FormattedMessage id="projectNavigation.settings" defaultMessage="Settings" /></Link>
			<Link to={`${url}/t/users_permissions`}><FormattedMessage id="projectNavigation.usersPermissions" defaultMessage="Users permissions" /></Link>
		</Container>
	);
};
