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

import { LOGIN_PATH } from '@/v5/ui/routes/routes.constants';
import { useEffect } from 'react';
import axios from 'axios';
import { useHistory, useLocation } from 'react-router-dom';
import { AuthActionsDispatchers } from '@/v5/services/actionsDispatchers';
import { AuthHooksSelectors } from '@/v5/services/selectorsHooks';
import { isNotLoggedIn } from '@/v5/validation/errors.helpers';
import { Route, RouteProps } from './route.component';

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

	// Unauthenticate when session times out
	axios.interceptors.response.use(
		(response) => response,
		(error) => {
			try {
				if (isNotLoggedIn(error)) AuthActionsDispatchers.setAuthenticationStatus(false);
				return Promise.reject(error);
			} catch (e) {
				return Promise.reject(error);
			}
		},
	);

	return children;
};

export const AuthenticatedRoute = ({ children, ...props }: RouteProps) => (
	<Route {...props}><WrapAuthenticationRedirect>{children}</WrapAuthenticationRedirect></Route>
);
