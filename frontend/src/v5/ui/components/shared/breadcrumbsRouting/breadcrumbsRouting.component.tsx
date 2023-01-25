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
import { TeamspacesHooksSelectors, ProjectsHooksSelectors, FederationsHooksSelectors, ContainersHooksSelectors } from '@/v5/services/selectorsHooks';
import { ITeamspace } from '@/v5/store/teamspaces/teamspaces.redux';
import { IProject } from '@/v5/store/projects/projects.types';
import { FEDERATIONS_ROUTE, matchesPath, TEAMSPACE_ROUTE_BASE, PROJECT_ROUTE, VIEWER_ROUTE, TEAMSPACE_ROUTE, BOARD_ROUTE } from '@/v5/ui/routes/routes.constants';
import { useSelector } from 'react-redux';
import { selectRevisions } from '@/v4/modules/model/model.selectors';
import { formatMessage } from '@/v5/services/intl';
import { BreadcrumbItem } from '@controls/breadcrumbs/breadcrumbDropdown/breadcrumbDropdown.component';
import { Breadcrumbs } from '@controls/breadcrumbs';
import { BreadcrumbItemOrOptions } from '@controls/breadcrumbs/breadcrumbs.component';

export const BreadcrumbsRouting = () => {
	const params = useParams();
	const { teamspace, revision, containerOrFederation: containerOrFederationId } = params;
	const teamspaces: ITeamspace[] = TeamspacesHooksSelectors.selectTeamspaces();
	const projects: IProject[] = ProjectsHooksSelectors.selectCurrentProjects();
	const project: IProject = ProjectsHooksSelectors.selectCurrentProjectDetails();

	const federations = FederationsHooksSelectors.selectFederations();
	const containers = ContainersHooksSelectors.selectContainers();

	// Because we are using v4 viewer for now, we use the v4 selector.
	const revisions = useSelector(selectRevisions);

	const isFederation = federations.some(({ _id }) => _id === containerOrFederationId);

	let breadcrumbs: BreadcrumbItemOrOptions[] = [];
	let options: BreadcrumbItem[];

	if (matchesPath(TEAMSPACE_ROUTE)) {
		options = teamspaces.map(({ name }) => ({
			title: name,
			to: generatePath(TEAMSPACE_ROUTE_BASE, { teamspace: name }),
			selected: name === teamspace,
		}));

		breadcrumbs = [{ options }];
	}

	if (matchesPath(PROJECT_ROUTE)) {
		breadcrumbs = [
			{
				title: teamspace,
				to: generatePath(TEAMSPACE_ROUTE_BASE, { teamspace }),
			},
		];

		// eslint-disable-next-line no-restricted-globals
		const { params: projectParams } = matchPath(location.pathname, { path: PROJECT_ROUTE });

		options = projects.map(({ name, _id }) => ({
			title: name,
			to: generatePath(PROJECT_ROUTE, { ...projectParams, project: _id }),
			selected: project?._id === _id,
		}));

		breadcrumbs.push({ options });
	}

	if (matchesPath(BOARD_ROUTE)) {
		breadcrumbs = [
			{
				title: teamspace,
				to: generatePath(TEAMSPACE_ROUTE_BASE, { teamspace }),
			},
		];

		// eslint-disable-next-line no-restricted-globals
		const { params: projectParams } = matchPath(location.pathname, { path: BOARD_ROUTE });

		options = projects.map(({ name, _id }) => ({
			title: name,
			to: generatePath(BOARD_ROUTE, { ...projectParams, project: _id }),
			selected: project?._id === _id,
		}));

		breadcrumbs.push({ options });
	}

	if (matchesPath(VIEWER_ROUTE)) {
		breadcrumbs = [
			{
				title: teamspace,
				to: generatePath(TEAMSPACE_ROUTE_BASE, { teamspace }),
			},
			{
				title: project?.name,
				to: generatePath(FEDERATIONS_ROUTE, params),
			},
		];

		if (isFederation) { // In the case the user is viewing a federation
			options = federations.map(({ _id, name }) => ({
				title: name,
				to: generatePath(VIEWER_ROUTE, { ...params, containerOrFederation: _id, revision: null }),
				selected: _id === containerOrFederationId,
			}));

			breadcrumbs.push({ options });
		} else { // In the case that the user is viewing a container
			options = containers.map(({ _id, name }) => ({
				title: name,
				to: generatePath(VIEWER_ROUTE, { ...params, containerOrFederation: _id, revision: null }),
				selected: _id === containerOrFederationId,
			}));
			breadcrumbs.push({ options });

			// Revisions options ( only containers have revisions)
			const noName = formatMessage({ id: 'breadcrumbs.revisions.noName', defaultMessage: '(no name)' });

			const revisionOptions = revisions.map(({ _id, tag }) => ({
				title: tag || noName,
				to: generatePath(VIEWER_ROUTE, { ...params, revision: tag || _id }),
				selected: _id === revision || tag === revision,
			}));

			breadcrumbs.push({
				secondary: true,
				options: revisionOptions,
			});
		}
	}

	return (<Breadcrumbs breadcrumbs={breadcrumbs} />);
};
