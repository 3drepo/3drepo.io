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
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';
import { Panel } from '../components/panel/panel.component';
import { Logo } from '../components/logo/logo.component';

import { Container, Paragraph } from './registerRequest.styles';

export class RegisterRequest extends React.PureComponent<any, any> {
	public render() {
		return (
			<Container
				container
				direction="column"
				alignItems="center"
				wrap="nowrap"
				>
				<Link to="/login"><Logo /></Link>
				<Grid item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Sign up request">
						<Paragraph>
							Thank you for signing up with 3D Repo.
						</Paragraph>
						<Paragraph>
							An email has been sent to verify your request.
							You must click on the link to complete the sign up process.
						</Paragraph>
						<Paragraph>
							If you have not received this, please check your spam folder or ask your email administrator for assistance.
						</Paragraph>
					</Panel>
				</Grid>
			</Container>
		);
	}
}
