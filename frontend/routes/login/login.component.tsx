/**
 *  Copyright (C) 2020 3D Repo Ltd
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

import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { Field, Form, Formik } from 'formik';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import * as Yup from 'yup';

import { clientConfigService } from '../../services/clientConfig';
import { schema } from '../../services/validation';
import { Panel } from '../components/panel/panel.component';
import { SubmitButton } from '../components/submitButton/submitButton.component';
import { Footer } from './components/footer';
import { Container, Headline, LoginButtons, StyledButton, UserNotice } from './login.styles';

const LoginSchema = Yup.object().shape({
	login: schema.required,
	password: schema.password.min(0)
});

const DEFAULT_INPUT_PROPS = {
	margin: 'normal',
	required: true,
	fullWidth: true,
	InputLabelProps: {
		shrink: true
	}
};

const USER_NOTICE = clientConfigService.userNotice;
const WELCOME_MESSAGE = clientConfigService.getCustomLoginMessage() || 'Welcome to 3D Repo';

interface IProps {
	history: any;
	location: any;
	isPending: boolean;
	isAuthenticated: boolean;
	onLogin: (login, password) => void;
	authenticate: () => void;
}

interface IState {
	login: string;
	password: string;
}

export class Login extends React.PureComponent<IProps, IState> {
	public formRef = React.createRef<any>();

	public state = {
		login: '',
		password: ''
	};

	public componentDidMount() {
		this.props.authenticate();
	}

	public componentDidUpdate(prevPops) {
		const { isAuthenticated } = prevPops;
	}

	public handleSubmit = (data) => {
		this.props.onLogin(data.login, data.password);
	}

	public renderLoginButtons = () => (
		<LoginButtons container alignItems="center" justify="space-between">
			<StyledButton
				color="secondary"
				component={Link}
				to="/password-forgot"
			>
				Forgot password?
			</StyledButton>

			<Field render={({ form }) => (
				<SubmitButton
					pending={this.props.isPending}
					disabled={!form.isValid || form.isValidating}
				>
					Log in
				</SubmitButton>
			)} />
		</LoginButtons>
	)

	public render() {
		const { login, password } = this.state;

		if (this.props.isAuthenticated) {
			const from = this.props.location?.state?.from || {};
			return (<Redirect to={{	...from, state: { referrer: '/login' } }} /> );
		}

		return (
			<Container
				container
				direction="column"
				alignItems="center"
				wrap="nowrap">
				<Grid item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Log in" hiddenScrollbars>
						<Headline>{WELCOME_MESSAGE}</Headline>
						{USER_NOTICE && <UserNotice>{USER_NOTICE}</UserNotice>}

						<Formik
							initialValues={{ login, password }}
							onSubmit={this.handleSubmit}
							validationSchema={LoginSchema}
							ref={this.formRef}
						>
							<Form>
								<Field name="login" render={({ field }) => (
									<TextField
										{...DEFAULT_INPUT_PROPS}
										{...field}
										label="Username or email"
										placeholder="Type username or email..."
										autoComplete="login"
										autoFocus
									/>
								)} />
								<Field name="password" render={({ field }) => (
									<TextField
										{...DEFAULT_INPUT_PROPS}
										{...field}
										label="Password"
										type="password"
										placeholder="Type password..."
										autoComplete="current-password"
									/>
								)} />

								{this.renderLoginButtons()}
							</Form>
						</Formik>
						<Divider light />
						<Footer />
					</Panel>
				</Grid>
			</Container>
		);
	}
}
