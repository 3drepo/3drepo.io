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
import { ProjectsHooksSelectors, TeamspacesHooksSelectors, TicketsHooksSelectors } from '@/v5/services/selectorsHooks';
import { Container, Link } from '../navigationTabs.styles';
import { useKanbanNavigationData } from '@/v5/helpers/kanban.hooks';

export const ProjectNavigation = (): JSX.Element => {
	const { linkLabel, shouldRenderLink } = useKanbanNavigationData();
	const isProjectAdmin = ProjectsHooksSelectors.selectIsProjectAdmin();
	const permissionsOnUIDisabled = TeamspacesHooksSelectors.selectPermissionsOnUIDisabled();
	const hasPermissions = !permissionsOnUIDisabled && isProjectAdmin;
	const tableLink = TicketsHooksSelectors.selectTicketsTableLink();

	return (
		<Container>
			<Link to={'t/federations'}><FormattedMessage id="projectNavigation.federations" defaultMessage="Federations" /></Link>
			<Link to={'t/containers'}><FormattedMessage id="projectNavigation.containers" defaultMessage="Containers" /></Link>
			<Link to={'t/drawings'}><FormattedMessage id="projectNavigation.drawings" defaultMessage="Drawings" /></Link>
			{shouldRenderLink &&  <Link to={'t/board'}>{linkLabel}</Link> }
			<Link to={tableLink}><FormattedMessage id="projectNavigation.tickets" defaultMessage="Tickets" /></Link>
			<Link to={'t/project_settings'}><FormattedMessage id="projectNavigation.settings" defaultMessage="Project settings" /></Link>
			{hasPermissions && <Link to={'t/project_permissions'}><FormattedMessage id="projectNavigation.projectPermissions" defaultMessage="Project permissions" /></Link> }
			{hasPermissions && <Link to={'t/user_permissions'}><FormattedMessage id="projectNavigation.userPermission" defaultMessage="User permissions" /></Link> }
		</Container>
	);
};
