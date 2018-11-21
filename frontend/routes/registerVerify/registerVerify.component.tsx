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
import * as queryString from 'query-string';
import Grid from '@material-ui/core/Grid';
import { Link } from 'react-router-dom';

import { Panel } from '../components/panel/panel.component';
import { Logo } from '../components/logo/logo.component';

import { Container, Paragraph, Buttons, StyledButton  } from './registerVerify.styles';

interface IProps {
	match: any;
	location: any;
	history: any;
	verifyRequest: (username, token) => void;
	verifyMessage: string;
	isPending: boolean;
}

interface IState {
	verifyMessage: string;
}

export class RegisterVerify extends React.PureComponent<IProps, IState> {
	public state = {
		verifyMessage: ''
	};

	public componentDidMount() {
		const { username, token } = queryString.parse(this.props.location.search);
		const { verifyMessage } = this.props;
		const missingParams = !username || !token;
		const missingParamsMessage = 'Can\'t verify: Token and/or Username not provided';

		if (missingParams || verifyMessage) {
			this.setState({
				verifyMessage: missingParams ? missingParamsMessage : verifyMessage
			});
		} else {
			this.props.verifyRequest(username, token);
		}
	}
	public componentDidUpdate(prevProps) {
		const { verifyMessage } = this.props;

		if (prevProps.verifyMessage !== verifyMessage) {
			this.setState({ verifyMessage });
		}
	}
	public render() {
		const { verifyMessage } = this.state;
		const { isPending } = this.props;

		return (
			<Container
				container
				direction="column"
				justify="center"
				alignItems="center">
				<Logo />
				<Grid item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Registered for 3D Repo">
						<Paragraph>
							{verifyMessage && verifyMessage}
						</Paragraph>

						<Buttons container justify="space-between">
							<StyledButton
								color="secondary"
								component={Link}
								to="/login"
								disabled={isPending}
							>
								Back to Login
							</StyledButton>
						</Buttons>
					</Panel>
				</Grid>
			</Container>
		);
	}
}
