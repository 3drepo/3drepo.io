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
import { upperCase } from 'lodash';

import Grid from '@material-ui/core/Grid';
import { Name, Login, Company } from './cellUser.styles';

interface IProps {
	data: any;
}

export class CellUser extends React.PureComponent<IProps, any> {

	public render() {
		return (
			<Grid
				container
				direction="column"
				justify="center"
				alignItems="flex-start"
			>
				<Name item>{upperCase(this.props.data.lastName)}, {this.props.data.firstName}</Name>
				<Login item>{this.props.data.user}</Login>
				<Company item>{this.props.data.company}</Company>
			</Grid>
		);
	}
}
