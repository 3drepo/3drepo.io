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
import { DialogContainer } from '../components/dialogContainer';
import { SnackbarContainer } from '../components/snackbarContainer';

interface IProps {
	authenticate: () => void;
}

export class App extends React.PureComponent<IProps, any> {
	public componentDidMount() {
		this.props.authenticate();
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
