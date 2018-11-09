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
import Button from '@material-ui/core/Button';

import { schema } from '../../services/validation';
import { Panel } from '../components/panel/panel.component';
import { Logo } from '../components/logo/logo.component';
import { Container, Headline, LoginButtons, StyledButton } from './login.styles';
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

interface IProps {
	history: any;
	location: any;
	headlineText?: string;
	onLogin: (login, password) => void;
}

interface IState {
	login: string;
	password: string;
}

export class Login extends React.PureComponent<IProps, IState> {
	public state = {
		login: '',
		password: ''
	};

	public handleSubmit = (data, form) => {
		this.props.onLogin(data.login, data.password);
		form.resetForm();
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
				<Button
					type="submit"
					color="secondary"
					variant="raised"
					disabled={!form.isValid || form.isValidating}
				>
					Log in
				</Button>
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
				justify="center"
				alignItems="center">
				<Grid item>
					<Logo />
				</Grid>
				<Grid item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Log in">
						<Headline>{headlineText || 'Welcome to 3D Repo'}</Headline>

						<Formik
							initialValues={{ login, password }}
							onSubmit={this.handleSubmit}
							validationSchema={LoginSchema}
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

								{ this.renderLoginButtons() }
							</Form>
						</Formik>
						<Footer />
					</Panel>
				</Grid>
			</Grid>
		);
	}
}
