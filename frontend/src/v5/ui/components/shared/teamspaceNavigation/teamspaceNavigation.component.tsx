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
import { useRouteMatch } from 'react-router-dom';
import { discardSlash } from '@/v5/services/routing/routing';
import { FormattedMessage } from 'react-intl';
import { Container, Link } from './teamspaceNavigaton.styles';

export const TeamspaceNavigation = (): JSX.Element => {
	let { url } = useRouteMatch();
	url = discardSlash(url);

	return (
		<Container>
			<Link to={`${url}/t/project`}><FormattedMessage id="teamspaceNavigation.project" defaultMessage="Project" /></Link>
			<Link to={`${url}/t/settings`}><FormattedMessage id="teamspaceNavigation.settings" defaultMessage="Settings" /></Link>
			<Link to={`${url}/t/users`}><FormattedMessage id="teamspaceNavigation.users" defaultMessage="Users" /></Link>
			<Link to={`${url}/t/jobs`}><FormattedMessage id="teamspaceNavigation.jobs" defaultMessage="Jobs" /></Link>
		</Container>
	);
};
