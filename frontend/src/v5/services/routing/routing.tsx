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
import { Route, useHistory, useLocation } from 'react-router-dom';
import { generatePath } from 'react-router';
import { IRevision } from '@/v5/store/revisions/revisions.types';
import { LOGIN_PATH, VIEWER_ROUTE } from '@/v5/ui/routes/routes.constants';
import { useEffect } from 'react';
import { AuthActionsDispatchers } from '../actionsDispatchers/authActions.dispatchers';
import { AuthHooksSelectors } from '../selectorsHooks/authSelectors.hooks';

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

type RevisionParam = IRevision | string | null | undefined;
type ContainerOrFederationParam = IContainer | IFederation | string;

const relativeViewerRoute = (
	teamspace: string,
	project,
	containerOrFederation: ContainerOrFederationParam,
	revision: RevisionParam,
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

export const viewerRoute = (
	teamspace: string,
	project: string,
	containerOrFederation: ContainerOrFederationParam,
	revision: RevisionParam = undefined,
	withDomain: boolean = false,
) => {
	const domain = withDomain ? getBaseDomain() : '';
	return `${domain}${relativeViewerRoute(teamspace, project, containerOrFederation, revision)}`;
};

interface RouteProps {
	path?: string;
	exact?: boolean;
	children?: any;
}

const WrapAuthenticationRedirect = ({ children }) => {
	const history = useHistory();
	const isAuthenticated: boolean = AuthHooksSelectors.selectIsAuthenticated();
	const authenticationFetched: boolean = AuthHooksSelectors.selectAuthenticationFetched();

	const { pathname } = useLocation();
	AuthActionsDispatchers.setReturnUrl(pathname);

	useEffect(() => {
		if (!isAuthenticated && authenticationFetched) {
			history.replace(LOGIN_PATH);
		}
	}, [isAuthenticated, authenticationFetched]);

	if (!isAuthenticated) {
		return (<></>);
	}

	return children;
};

export const AuthenticatedRoute = ({ children, ...props }: RouteProps) => (
	<Route {...props}><WrapAuthenticationRedirect>{children}</WrapAuthenticationRedirect></Route>
);
