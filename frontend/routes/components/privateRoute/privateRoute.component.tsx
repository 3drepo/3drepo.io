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
import { Route, Redirect } from 'react-router-dom';
import TopMenu from '../topMenu/topMenu.container';
import { ROUTES } from '../../../constants/routes';
import { STATIC_ROUTES } from '../../../services/staticPages';
import { ExternalLinks, ExternalLink } from './privateRoute.styles';

export const PrivateRoute = ({ component: Component, isAuthenticated, onLogout, push, ...routeProps }) => {
	const redirect = (props) => (
		<Redirect to={{
			pathname: ROUTES.LOGIN,
			state: { from: props.location }
		}} />
	);

	const onLogoClick = () => {
		let path = ROUTES.HOME;
		if (isAuthenticated) {
			path = ROUTES.TEAMSPACES;
		}

		push(path);
	};

	const renderExternalLinks = () => {
		const links = [
			...STATIC_ROUTES,
			{ title: 'Contact', path: 'http://3drepo.org/contact/' },
			{ title: 'Contact', path: 'http://3drepo.org/contact/' }
		];
		return (
			<ExternalLinks>
				{links.map(({ path, title }, index) => (
					<ExternalLink key={index} href={path}>{title}</ExternalLink>
				))}
			</ExternalLinks>
		);
	};

	const renderComponent = (props) => (
		<>
			<TopMenu
				onLogout={onLogout}
				onLogoClick={onLogoClick}
				id="topMenu"
			/>
			<Component {...props} />
			{renderExternalLinks()}
		</>
	);

	const renderRoute = (props) => isAuthenticated ? renderComponent(props) : redirect(props);
	return <Route {...routeProps} render={renderRoute} />;
};
