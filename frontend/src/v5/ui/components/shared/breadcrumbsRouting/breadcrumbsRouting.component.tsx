/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { useParams, generatePath, matchPath } from 'react-router-dom';
import { TeamspacesHooksSelectors } from '@/v5/services/selectorsHooks/teamspacesSelectors.hooks';
import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { ProjectsHooksSelectors } from '@/v5/services/selectorsHooks/projectsSelectors.hooks';
import { IProject } from '@/v5/store/projects/projects.redux';
import { CONTAINERS_ROUTE, DASHBOARD_ROUTE, FEDERATIONS_ROUTE, matchesPath, PROJECTS_ROUTE, PROJECT_ROUTE, VIEWER_ROUTE } from '@/v5/ui/routes/routes.constants';
import { useSelector } from 'react-redux';
import { selectCurrentModelName, selectIsFederation, selectRevisions } from '@/v4/modules/model/model.selectors';
import { formatMessage } from '@/v5/services/intl';
import { IListItem } from '@controls/breadcrumbs/navigatonMenu/navigationMenu.component';
import { Breadcrumbs } from '@controls/breadcrumbs';

export const BreadcrumbsRouting = () => {
	const params = useParams();
	const { teamspace, revision } = params;
	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();
	const project: IProject = ProjectsHooksSelectors.selectCurrentProjectDetails();

	// Because we are using v4 viewer for now, we use the v4 selectors.
	const isFederation = useSelector(selectIsFederation);
	const federationOrContainerName = useSelector(selectCurrentModelName);
	const revisions = useSelector(selectRevisions);

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
				to: generatePath(FEDERATIONS_ROUTE, params),
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

			const noName = formatMessage({ id: 'breadcrumbs.revisions.noName', defaultMessage: '(no name)' });

			const selectedRevision = revisions.find(
				({ _id, tag }) => _id === revision || tag === revision,
			) || revisions[0];

			breadcrumbs.push({
				title: selectedRevision?.tag || noName,
				id: revision,
			});

			options = revisions.map(({ _id, tag }) => ({
				title: tag || noName,
				to: generatePath(VIEWER_ROUTE, { ...params, revision: tag || _id }),
				id: _id,
			}));
		}
	}

	return (<Breadcrumbs breadcrumbs={breadcrumbs} options={options} />);
};
