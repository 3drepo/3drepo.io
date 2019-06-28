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

import * as React from 'react';
import { Route } from 'react-router-dom';
import { ExternalLinks } from '../externalLinks/externalLinks.component';

export const PublicRoute = ({ component: Component, ...routeProps }) => {
	const renderComponent = (props) => (
		<>
			<Component {...props} />
			<ExternalLinks />
		</>
	);

	const renderRoute = (props) => renderComponent(props);

	return <Route {...routeProps} render={renderRoute} />;
};
