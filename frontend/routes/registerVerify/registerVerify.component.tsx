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

import Grid from '@material-ui/core/Grid';
import * as queryString from 'query-string';
import React from 'react';
import { Link } from 'react-router-dom';

import { Panel } from '../components/panel/panel.component';
import { Buttons, Container, Paragraph, StyledButton  } from './registerVerify.styles';

interface IProps {
	match: any;
	location: any;
	history: any;
	message: string;
	isPending: boolean;
	verifyRequest: (username, token) => void;
	clearMessage: () => void;
}

interface IState {
	message: string;
}

export class RegisterVerify extends React.PureComponent<IProps, IState> {
	public state = {
		message: ''
	};

	public componentDidMount() {
		const { username, token } = queryString.parse(this.props.location.search);
		const { message } = this.props;
		const missingParams = !username || !token;
		const missingParamsMessage = 'Can\'t verify: Token and/or Username not provided';

		if (missingParams || message) {
			this.setState({
				message: missingParams ? missingParamsMessage : message
			});
		} else {
			this.props.verifyRequest(username, token);
		}
	}

	public componentDidUpdate(prevProps) {
		const { message } = this.props;

		if (prevProps.message !== message) {
			this.setState({ message });
		}
	}

	public componentWillUnmount() {
		this.props.clearMessage();
	}

	public render() {
		const { message } = this.state;
		const { isPending } = this.props;

		return (
			<Container
				container
				direction="column"
				alignItems="center"
				wrap="nowrap"
			>
				<Grid item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Registered for 3D Repo">
						{message && <Paragraph> {message} </Paragraph>}
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
