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
import { Route as BaseRoute, useHistory, useLocation } from 'react-router-dom';
import { generatePath } from 'react-router';
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { LOGIN_PATH, VIEWER_ROUTE, PROJECT_ROUTE_BASE } from '@/v5/ui/routes/routes.constants';
import { useEffect } from 'react';
import { AuthActionsDispatchers } from '../actionsDispatchers/authActions.dispatchers';
import { AuthHooksSelectors } from '../selectorsHooks/authSelectors.hooks';
import { ProjectsHooksSelectors } from '../selectorsHooks/projectsSelectors.hooks';
import { ContainersHooksSelectors } from '../selectorsHooks/containersSelectors.hooks';
import { FederationsHooksSelectors } from '../selectorsHooks/federationsSelectors.hooks';
import { formatMessage } from '../intl';

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

interface RouteProps {
	computedMatch?: any;
	title?: string;
	path?: string;
	exact?: boolean;
	children?: any;
}

const WrapAuthenticationRedirect = ({ children }) => {
	const history = useHistory();
	const isAuthenticated: boolean = AuthHooksSelectors.selectIsAuthenticated();
	const authenticationFetched: boolean = AuthHooksSelectors.selectAuthenticationFetched();

	const location = useLocation();

	useEffect(() => {
		AuthActionsDispatchers.setReturnUrl(location);
		if (!isAuthenticated && authenticationFetched) {
			history.replace(LOGIN_PATH);
		}
	}, [isAuthenticated, authenticationFetched]);

	if (!isAuthenticated) {
		return (<></>);
	}

	return children;
};

const DEFAULT_TITLE = formatMessage({ id: 'pageTitle.default', defaultMessage: '3D Repo | Online BIM collaboration platform' });
const LOADING_TEXT = formatMessage({ id: 'pageTitle.loading', defaultMessage: 'Loading...' });

const truncateValue = (str = '', max = 10) => {
	let truncatedStr = str.substring(0, max);
	if (str.length > truncatedStr.length) truncatedStr += '...';
	return truncatedStr;
};

export const Route = ({ title, children, computedMatch: { params }, ...props }: RouteProps) => {
	const projectName = ProjectsHooksSelectors.selectCurrentProjectName();
	const containerName = ContainersHooksSelectors.selectContainerById(params.containerOrFederation)?.name;
	const federationName = FederationsHooksSelectors.selectFederationById(params.containerOrFederation)?.name;
	const containerOrFederationName = containerName || federationName || '';
	const revisionTag = useSelector(selectCurrentRevision)?.tag || LOADING_TEXT;

	const parseTitle = (string) => string.replace(/:(\S+)/g, (_, match) => {
		if (match === 'project') {
			return truncateValue(projectName) || LOADING_TEXT;
		}
		if (match === 'revision') {
			return params.revision ? `(${truncateValue(revisionTag)})` : '';
		}
		if (match === 'containerOrFederation') {
			return truncateValue(containerOrFederationName) || LOADING_TEXT;
		}

		return truncateValue(params[match]) || '';
	});

	const titleParsed = title ? parseTitle(title) : '';

	useEffect(() => {
		if (titleParsed) {
			document.title = titleParsed;
		}
		return () => {
			document.title = DEFAULT_TITLE;
		};
	}, [titleParsed]);

	return <BaseRoute {...props}>{children}</BaseRoute>;
};

export const AuthenticatedRoute = ({ children, ...props }: RouteProps) => (
	<Route {...props}><WrapAuthenticationRedirect>{children}</WrapAuthenticationRedirect></Route>
);
