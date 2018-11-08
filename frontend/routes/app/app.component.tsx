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

export class App extends React.PureComponent<IProps, IState> {
	public state = {
		referrer: DEFAULT_REDIRECT
	};

	public componentDidMount() {
		this.props.authenticate();
	}

	public componentDidUpdate(prevProps) {
		const changes = {} as IState;
		const { location, history, isAuthenticated } = this.props;

		if (isAuthenticated !== prevProps.isAuthenticated) {
			if (isAuthenticated) {
				history.push(this.state.referrer);
				changes.referrer = DEFAULT_REDIRECT;
			} else {
				// To force Agnular to refresh state
				runAngularTimeout(() => {
					history.push('/login');
				});
				changes.referrer = `${location.pathname }${ location.search }`;
			}
		}

		if (!isEmpty(changes)) {
			this.setState(changes);
		}
	}

	public render() {
		// TODO: In the future it'll return first level routes
		return (
			<>
				<DialogContainer />
				<SnackbarContainer />
			</>
		);
	}
}
