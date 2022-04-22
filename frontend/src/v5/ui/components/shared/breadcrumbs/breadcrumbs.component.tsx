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
import { useState, MouseEvent } from 'react';
import { useParams, generatePath, matchPath } from 'react-router-dom';
import HomeIcon from '@assets/icons/home.svg';
import DownArrowIcon from '@assets/icons/down_arrow.svg';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { IProject } from '@/v5/store/projects/projects.redux';
import { CONTAINERS_ROUTE, DashboardParams, DASHBOARD_ROUTE, FEDERATIONS_ROUTE, matchesPath, PROJECTS_ROUTE, PROJECT_ROUTE, VIEWER_ROUTE } from '@/v5/ui/routes/routes.constants';
import { useSelector } from 'react-redux';
import { selectCurrentModelName, selectIsFederation } from '@/v4/modules/model/model.selectors';
import { NavigationMenu } from '../navigatonMenu';
import { Container, HomeIconBreadcrumb, Breadcrumb, InteractiveBreadcrumb, OverflowWrapper } from './breadcrumbs.styles';
import { IListItem } from '../navigatonMenu/navigationMenu.component';

export const Breadcrumbs = (): JSX.Element => {
	const params = useParams<DashboardParams>();
	const { teamspace } = params;
	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();
	const project: IProject = ProjectsHooksSelectors.selectCurrentProjectDetails();
	const isFederation = useSelector(selectIsFederation);
	const federationOrContainerName = useSelector(selectCurrentModelName);

	let breadcrumbs: IListItem[] = [];
	let options: IListItem[] = [];

	if (matchesPath(PROJECTS_ROUTE)) {
		breadcrumbs = [
			{
				title: teamspace,
			},
		];

		options = teamspaces.map(({ name }) => ({
			title: name,
			to: generatePath(PROJECTS_ROUTE, { teamspace: name }),
		}));
	}

	if (matchesPath(PROJECT_ROUTE)) {
		breadcrumbs = [
			{
				title: teamspace,
				to: generatePath(PROJECTS_ROUTE, { teamspace }),
			},
			{
				title: project?.name,
			},
		];

		// eslint-disable-next-line no-restricted-globals
		const { params: projectParams } = matchPath(location.pathname, { path: PROJECT_ROUTE });

		options = projects.map(({ name, _id }) => ({
			title: name,
			to: generatePath(PROJECT_ROUTE, { ...projectParams, project: _id }),
		}));
	}

	if (matchesPath(VIEWER_ROUTE)) {
		breadcrumbs = [
			{
				title: teamspace,
				to: DASHBOARD_ROUTE,
			},
			{
				title: project?.name,
				to: generatePath(PROJECTS_ROUTE, params),
			},
		];

		if (isFederation) {
			breadcrumbs.push({
				title: federationOrContainerName,
				to: generatePath(FEDERATIONS_ROUTE, params),
			});
		}

		if (!isFederation) {
			breadcrumbs.push({
				title: federationOrContainerName,
				to: generatePath(CONTAINERS_ROUTE, params),
			});

			// options =
		}
	}

	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleClick = (event: MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	return (
		<Container aria-label="breadcrumb">
			<HomeIconBreadcrumb color="inherit" to={DASHBOARD_ROUTE}>
				<HomeIcon />
			</HomeIconBreadcrumb>

			{breadcrumbs.map(({ title, to }, index) => (
				(breadcrumbs.length - 1) === index && options.length
					? (
						<div key={title}>
							<InteractiveBreadcrumb onClick={handleClick} endIcon={<DownArrowIcon />}>
								<OverflowWrapper>
									{title}
								</OverflowWrapper>
							</InteractiveBreadcrumb>
							<NavigationMenu
								list={options}
								anchorEl={anchorEl}
								selectedItem={title}
								handleClose={handleClose}
							/>
						</div>
					) : (
						<Breadcrumb key={title} color="inherit" to={to}>
							{title}
						</Breadcrumb>
					)
			))}
		</Container>
	);
};
