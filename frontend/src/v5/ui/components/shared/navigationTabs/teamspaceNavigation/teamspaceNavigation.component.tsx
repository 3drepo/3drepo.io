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
import { FormattedMessage } from 'react-intl';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, Link } from '../navigationTabs.styles';

export const TeamspaceNavigation = (): JSX.Element => {
	const isAdmin = TeamspacesHooksSelectors.selectIsTeamspaceAdmin();

	return (
		<Container>
			<Link to="t/projects"><FormattedMessage id="teamspaceNavigation.projects" defaultMessage="Projects" /></Link>
			<Link to="t/jobs"><FormattedMessage id="teamspaceNavigation.jobs" defaultMessage="Jobs" /></Link>
			<Link to="t/settings"><FormattedMessage id="teamspaceNavigation.settings" defaultMessage="Teamspace Settings" /></Link>
			{isAdmin && <Link to="t/users"><FormattedMessage id="teamspaceNavigation.users" defaultMessage="Users" /></Link>}
		</Container>
	);
};
