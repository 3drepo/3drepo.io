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
import { discardSlash, discardUrlComponent } from '@/v5/services/routing/routing';
import { FormattedMessage } from 'react-intl';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, Link } from '../navigationTabs.styles';

export const ProjectNavigation = (): JSX.Element => {
	let { url } = useRouteMatch();
	url = discardSlash(url);
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();

	return (
		<Container>
			<Link to={`${url}/t/federations`}><FormattedMessage id="projectNavigation.federations" defaultMessage="Federations" /></Link>
			<Link to={`${url}/t/containers`}><FormattedMessage id="projectNavigation.containers" defaultMessage="Containers" /></Link>
			<Link to={`${url}/t/board`}><FormattedMessage id="projectNavigation.issuesAndRisks" defaultMessage="Issues and risks" /></Link>
			<Link to={`${url}/t/tasks`}><FormattedMessage id="projectNavigation.tasks" defaultMessage="Tasks" /></Link>
			<Link to={`${discardUrlComponent(url, 'settings')}/t/project_settings`}><FormattedMessage id="projectNavigation.settings" defaultMessage="Project settings" /></Link>
			{ isProjectAdmin && <Link to={`${url}/t/project_permissions`}><FormattedMessage id="projectNavigation.projectPermissions" defaultMessage="Project permissions" /></Link> }
			{ isProjectAdmin && <Link to={`${url}/t/user_permissions`}><FormattedMessage id="projectNavigation.userPermission" defaultMessage="User permissions" /></Link> }
		</Container>
	);
};
