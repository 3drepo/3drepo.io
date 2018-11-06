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

import { Container } from './login.styles';
import { Panel } from '../components/panel/panel.component';
import { Grid } from '@material-ui/core';

interface IProps {}

export class Login extends React.PureComponent<IProps, any> {
	public render() {
		return (
			<Grid
				container
				flex-direction="row"
				justify="center"
			>
				<Container item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Log in">
						Login component
					</Panel>
				</Container>
			</Grid>
		);
	}
}
