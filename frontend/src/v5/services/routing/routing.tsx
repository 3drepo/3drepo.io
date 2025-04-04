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
import { IContainer } from '@/v5/store/containers/containers.types';
import { IFederation } from '@/v5/store/federations/federations.types';
import { IProject } from '@/v5/store/projects/projects.types';
import { generatePath } from 'react-router';
import { VIEWER_ROUTE, PROJECT_ROUTE_BASE, PROJECT_ROUTE, TICKETS_SELECTION_ROUTE } from '@/v5/ui/routes/routes.constants';
import { IContainerRevision } from '@/v5/store/containers/revisions/containerRevisions.types';
import { generateFullPath } from '@/v5/helpers/url.helper';

export const projectRoute = (teamspace: string, project: IProject | string) => {
	const projectId = (project as IProject)?._id || (project as string);
	return generatePath(PROJECT_ROUTE_BASE, { teamspace, project: projectId });
};

export const projectTabRoute = (teamspace: string, project: IProject | string, tab: string) => {
	const projectId = (project as IProject)?._id || (project as string);
	return generatePath(PROJECT_ROUTE, { teamspace, project: projectId, tab });
};

type RevisionParam = IContainerRevision | string | null | undefined;
type ContainerOrFederationParam = IContainer | IFederation | string;
type ViewerSearchParams = {
	drawingId?: string,
	isCalibrating?: boolean,
	ticketId?: string,
	issueId?: string,
	riskId?: string,
};

export const viewerRoute = (
	teamspace: string,
	project,
	containerOrFederation: ContainerOrFederationParam,
	revision: RevisionParam = undefined,
	newSearchParams: ViewerSearchParams = {},
	keepSearchParams = true,
) => {
	const containerOrFederationId = (containerOrFederation as IContainer | IFederation)?._id
		|| (containerOrFederation as string);

	const revisionId = (revision as IContainerRevision)?._id || (revision as string);

	const params = {
		teamspace,
		project,
		containerOrFederation: containerOrFederationId,
		revision: revisionId,
	};

	return generateFullPath(VIEWER_ROUTE, params, newSearchParams, keepSearchParams);
};

export const ticketsSelectionRoute = (
	teamspace: string,
	project: string,
	containerOrFederation: string,
) => generatePath(TICKETS_SELECTION_ROUTE, { teamspace, project }) + `?models=${containerOrFederation}`;
