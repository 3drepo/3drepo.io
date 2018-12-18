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
import { Link } from 'react-router-dom';
import * as Yup from 'yup';
import { Formik, Field, Form } from 'formik';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { clientConfigService } from '../../services/clientConfig';
import { schema } from '../../services/validation';
import { Panel } from '../components/panel/panel.component';
import { Logo } from '../components/logo/logo.component';
import { SubmitButton } from '../components/submitButton/submitButton.component';
import { Container, Headline, LoginButtons, StyledButton, UserNotice } from './login.styles';
import { Footer } from './components/footer';

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

interface IProps {
	history: any;
	location: any;
	headlineText?: string;
	onLogin: (login, password) => void;
	isPending: boolean;
	isAuthenticated: boolean;
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

	public componentDidUpdate({ isAuthenticated }) {
		if (this.props.isAuthenticated && !isAuthenticated) {
			this.formRef.current.handleReset();
		}
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
		const { headlineText } = this.props;
		const { login, password } = this.state;

		return (
			<Container
				container
				direction="column"
				alignItems="center"
				wrap="nowrap">
				<Logo />
				<Grid item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Log in">
						<Headline>{headlineText || 'Welcome to 3D Repo'}</Headline>
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
										label="Username"
										placeholder="Type username..."
										autoComplete="login"
									/>
								)} />
								<Field name="password" render={({ field }) => (
									<TextField
										{...DEFAULT_INPUT_PROPS}
										{...field}
										label="Password"
										type="password"
										placeholder="Type password..."
										autoComplete="password"
									/>
								)} />

								{this.renderLoginButtons()}
							</Form>
						</Formik>
						<Footer />
					</Panel>
				</Grid>
			</Container>
		);
	}
}
