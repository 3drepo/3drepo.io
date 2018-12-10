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
import { Formik, Form, Field } from 'formik';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { Container, Message, Buttons, StyledButton } from './passwordForgot.styles';
import { Logo } from '../components/logo/logo.component';
import { Panel } from '../components/panel/panel.component';
import { SubmitButton } from '../components/submitButton/submitButton.component';

interface IProps {
	sendRequest: (userNameOrEmail) => void;
	isPending: boolean;
	message: string;
}

interface IState {
	userNameOrEmail: string;
}

export class PasswordForgot extends React.PureComponent<IProps, IState> {
	public state = {
		userNameOrEmail: ''
	};

	public handleSubmit = (data, form) => {
		this.props.sendRequest(data.userNameOrEmail);
	}

	public render() {
		const { userNameOrEmail } = this.state;
		const { isPending, message } = this.props;

		return (
			<Container
				container
				direction="column"
				alignItems="center">
				<Link to="/login"><Logo /></Link>
				<Grid item xs={9} sm={7} md={5} lg={3} xl={2}>
					<Panel title="Forgot password">
						{ message
							? <Message>{message}</Message>
							:
							<>
								<Message>Please enter your username or email</Message>
								<Formik
									initialValues={{ userNameOrEmail }}
									onSubmit={this.handleSubmit}
								>
									<Form>
										<Field name="userNameOrEmail" render={({ field }) => (
											<TextField
												{...field}
												margin="normal"
												placeholder="Type username or email..."
												fullWidth
											/>
										)} />
										<Buttons container justify="space-between">
											<StyledButton
												color="secondary"
												component={Link}
												to="/login"
												disabled={isPending}
											>
												Back to Login
											</StyledButton>
											<Field render={({ form }) => (
												<SubmitButton
													pending={isPending}
													disabled={!form.isValid || form.isValidating}
												>
													Send request
												</SubmitButton>
											)} />
										</Buttons>
									</Form>
								</Formik>
							</>
						}
					</Panel>
				</Grid>
			</Container>
		);
	}
}
