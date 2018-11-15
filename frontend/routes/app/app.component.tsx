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
import { isEmpty } from 'lodash';
import { runAngularTimeout } from '../../helpers/migration';
import { DialogContainer } from '../components/dialogContainer';
import { SnackbarContainer } from '../components/snackbarContainer';

interface IProps {
	location: any;
	history: any;
	isAuthenticated: boolean;
	authenticate: () => void;
}

interface IState {
	referrer?: string;
}

const DEFAULT_REDIRECT = '/dashboard/teamspaces';
const MAIN_ROUTE_PATH =  '/';

export class App extends React.PureComponent<IProps, IState> {
	public state = {
		referrer: DEFAULT_REDIRECT
	};

	public componentWillUnmount;

	private authenticationInterval;

	public isStaticRoute(path) {
		const staticRoutes = ['cookies', 'terms', 'privacy'] as any;
		return staticRoutes.includes(path.replace('/', ''));
	}

	public componentDidMount() {
		this.props.authenticate();
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { location, history, isAuthenticated } = this.props;
		const isStaticRoute = this.isStaticRoute(location.pathname);

		if (!isStaticRoute && isAuthenticated !== prevProps.isAuthenticated) {
			if (isAuthenticated) {
				history.push(this.state.referrer);
				changes.referrer = DEFAULT_REDIRECT;
			} else {
				if (location.pathname !== MAIN_ROUTE_PATH) {
					changes.referrer = `${location.pathname }${ location.search }`;
				}

				runAngularTimeout(() => {
					history.push('/login');
				});
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		// TODO: In the future it'll return first level routes eg. Dashboard, Login
		return (
			<>
				<DialogContainer />
				<SnackbarContainer />
			</>
		);
	}
}
