/**
 *  Copyright (C) 2017 3D Repo Ltd
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
import { Redirect, Route } from 'react-router-dom';
import { ROUTES } from '../../../constants/routes';

export const PrivateRoute = ({ component: Component, isAuthenticated, onLogout, push, ...routeProps }) => {
	if (isAuthenticated === null) {
		return null;
	}

	const redirect = (props) => (
		<Redirect to={{
			pathname: ROUTES.LOGIN,
			state: { from: props.location }
		}} />
	);
	const renderComponent = (props) => <Component {...props} />;

	const renderRoute = (props) => isAuthenticated ? renderComponent(props) : redirect(props);
	return <Route {...routeProps} render={renderRoute} />;
};
