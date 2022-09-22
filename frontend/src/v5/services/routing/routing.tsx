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
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { VIEWER_ROUTE, PROJECT_ROUTE_BASE } from '@/v5/ui/routes/routes.constants';

const appendSlashIfNeeded = (uri) => (uri[uri.length - 1] !== '/' ? `${uri}/` : uri);

export const discardSlash = (uri) => (uri[uri.length - 1] === '/' ? uri.slice(0, -1) : uri);

export const discardTab = (uri) => discardSlash(uri).split('/').slice(0, -1).join('/');

export const discardUrlComponent = (uri, component) => discardSlash(uri.replace(component, ''));

export const projectRoute = (teamspace: string, project: IProject | string) => {
	const projectId = (project as IProject)?._id || (project as string);
	return generatePath(PROJECT_ROUTE_BASE, { teamspace, project: projectId });
};

export const uriCombine = (uri, path) => {
	let pathname = appendSlashIfNeeded(uri);
	const otherPath = appendSlashIfNeeded(path);

	const url = new URL(pathname, 'http://domain.com');
	pathname = (new URL(otherPath, url)).pathname;

	const val = pathname.slice(0, -1); // takes out the '/' at the end
	return val;
};

export const prefixBaseDomain = (uri: string) => `${window.location.protocol}//${window.location.hostname}${uri}`;

type RevisionParam = IRevision | string | null | undefined;
type ContainerOrFederationParam = IContainer | IFederation | string;

export const viewerRoute = (
	teamspace: string,
	project,
	containerOrFederation: ContainerOrFederationParam,
	revision: RevisionParam = undefined,
) => {
	const containerOrFederationId = (containerOrFederation as IContainer | IFederation)?._id
		|| (containerOrFederation as string);

	const revisionId = (revision as IRevision)?._id || (revision as string);

	const params = {
		teamspace,
		project,
		containerOrFederation: containerOrFederationId,
		revision: revisionId,
	};

	return generatePath(VIEWER_ROUTE, params);
};
