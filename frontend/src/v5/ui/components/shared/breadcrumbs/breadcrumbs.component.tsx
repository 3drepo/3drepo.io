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
import { useParams, useRouteMatch, useHistory } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import HomeIcon from '@assets/icons/home.svg';
import DownArrowIcon from '@assets/icons/down_arrow.svg';
import { uriCombine } from '@/v5/services/routing/routing';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { ProjectsActionsDispatchers } from '@/v5/services/actionsDispatchers/projectsActions.dispatchers';
import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { IProject } from '@/v5/store/projects/projects.redux';
import { DialogsActions } from '@/v5/store/dialogs/dialogs.redux';
import { formatMessage } from '@/v5/services/intl';
import { NavigationMenu } from '../navigatonMenu';
import { Container, HomeIconBreadcrumb, Breadcrumb, InteractiveBreadcrumb, OverflowWrapper } from './breadcrumbs.styles';

const createToWithUrl = (url) => ({ to, title }) => ({ title, to: `${url}/${to}` });

const teamspaceList2LinkList = (teamspaces: ITeamspace[]) => (teamspaces.length ? teamspaces.map(({ name }) => ({
	to: name,
	title: name,
})) : []);

const projectList2LinkList = (projects: IProject[]) => (projects.length ? projects.map(({ name, _id }) => ({
	to: _id,
	title: name,
})) : []);

const lastItemOf = (list: any[]) => list[list.length - 1];

export const Breadcrumbs = (): JSX.Element => {
	const history = useHistory();
	const dispatch = useDispatch();
	const { teamspace } = useParams();
	let { project } = useParams();

	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();

	React.useEffect(() => {
		if (project) {
			ProjectsActionsDispatchers.fetch(teamspace);
			ProjectsActionsDispatchers.setCurrentProject(project);
		}
	}, [project, teamspace]);

	if (project && projects.length && !projects.find(({ _id }) => _id === project)) {
		dispatch(DialogsActions.open('alert', {
			onClickClose: () => history.push('/'),
			currentActions: formatMessage({ id: 'breadCrumbs.projectFetchError.title', defaultMessage: 'trying to find project' }),
			errorMessage: formatMessage({
				id: 'breadCrumbs.projectFetchError.details',
				defaultMessage: 'The project with id "{project}" was not found.',
			},
			{
				project,
			}),
			details: formatMessage({ id: 'breadCrumbs.projectFetchError.redirect', defaultMessage: 'You will be redirected to the main page of the dashboard.' }),
		}));

		project = null;
	}

	let { url } = useRouteMatch();

	const urlProject = project ? uriCombine(url, '../') : url;

	url = teamspace ? uriCombine(url, '../') : url;
	url = project ? uriCombine(url, '../') : url;

	const breadcrumbs = [];

	const teamspaceTo = `${url}/${teamspace}`;

	let list: any[] = !project ? teamspaceList2LinkList(teamspaces) : projectList2LinkList(projects) || [];

	if (teamspace) {
		breadcrumbs.push(teamspace);
	}

	if (project && projects.length) {
		breadcrumbs.push(list.find(({ to }) => to === project).title);
	}

	const selectedItem = lastItemOf(breadcrumbs);

	list = list.map(createToWithUrl(project ? urlProject : url));

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	return (
		<Container aria-label="breadcrumb">
			<HomeIconBreadcrumb color="inherit" to={teamspaceTo}>
				<HomeIcon />
			</HomeIconBreadcrumb>

			{breadcrumbs.map((title, index) => (
				(breadcrumbs.length - 1) === index
					? (
						<div key={title}>
							<InteractiveBreadcrumb onClick={handleClick} endIcon={<DownArrowIcon />}>
								<OverflowWrapper>
									{title}
								</OverflowWrapper>
							</InteractiveBreadcrumb>
							<NavigationMenu
								list={list}
								anchorEl={anchorEl}
								selectedItem={selectedItem}
								handleClose={handleClose}
							/>
						</div>
					) : (
						<Breadcrumb key={title} color="inherit" to={teamspaceTo}>
							{title}
						</Breadcrumb>
					)
			))}
		</Container>
	);
};
