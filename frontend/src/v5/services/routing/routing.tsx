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
import { Route, Switch } from 'react-router-dom';
import { generatePath } from 'react-router';
import { IRevision } from '@/v5/store/revisions/revisions.types';

const appendSlashIfNeeded = (uri) => (uri[uri.length - 1] !== '/' ? `${uri}/` : uri);

export const discardSlash = (uri) => (uri[uri.length - 1] === '/' ? uri.slice(0, -1) : uri);

export const discardUrlComponent = (uri, component) => discardSlash(uri.replace(component, ''));

export const uriCombine = (uri, path) => {
	let pathname = appendSlashIfNeeded(uri);
	const otherPath = appendSlashIfNeeded(path);

	const url = new URL(pathname, 'http://domain.com');
	pathname = (new URL(otherPath, url)).pathname;

	const val = pathname.slice(0, -1); // takes out the '/' at the end
	return val;
};

const getBaseDomain = () => `${window.location.protocol}//${window.location.hostname}`;

export const VIEWER_ROUTE = '/v5/viewer/:teamspace/:containerOrFederation/:revision?';

type RevisionParam = IRevision | string | null | undefined;
type ContainerOrFederationParam = IContainer | IFederation | string;

const relativeViewerRoute = (
	teamspace: string,
	containerOrFederation: ContainerOrFederationParam,
	revision: RevisionParam,
) => {
	const containerOrFederationId = (containerOrFederation as IContainer | IFederation)?._id || containerOrFederation;
	const revisionId = (revision as IRevision)?._id || (revision as string);

	const params = {
		teamspace,
		containerOrFederation: containerOrFederationId,
		revision: revisionId,
	};

	return generatePath(VIEWER_ROUTE, params);
};

export const viewerRoute = (
	teamspace: string,
	containerOrFederation: ContainerOrFederationParam,
	revision: RevisionParam = undefined,
	withDomain: boolean = false,
) => {
	const domain = withDomain ? getBaseDomain() : '';
	return `${domain}${relativeViewerRoute(teamspace, containerOrFederation, revision)}`;
};

export const RouteExcept = ({ path, exceptPath, children }) => (
	<Switch>
		<Route exact path={exceptPath} />
		<Route path={path}>
			{children}
		</Route>
	</Switch>
);
