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
import * as Yup from 'yup';
import { Formik, Field } from 'formik';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import { schema } from '../../services/validation';
import { clientConfigService } from '../../services/clientConfig';
import { Panel } from '../components/panel/panel.component';
import { Container, Headline, LoginButtons, StyledButton, Version, Footer } from './login.styles';

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

interface IProps {}

interface IState {
	login: string;
	password: string;
}

const APP_VERSION = clientConfigService.VERSION;

export class Login extends React.PureComponent<IProps, IState> {
	public state = {
		login: '',
		password: ''
	};

	public handleSubmit = () => {}

	public renderFooter = () => (
		<Footer container alignItems="center" justify="space-between">
			<Version flex-direction="row">
				Version:
				<Tooltip title="Release notes">
					<StyledButton>
						{APP_VERSION}
					</StyledButton>
				</Tooltip>
			</Version>
			<Grid>
				<StyledButton>Sign up</StyledButton>
				<StyledButton>Pricing</StyledButton>
			</Grid>
		</Footer>
	)

	public renderLoginButtons = () => (
		<LoginButtons container alignItems="center" justify="space-between">
			<StyledButton color="secondary">Forgot password?</StyledButton>

			<Field render={({ form }) => (
				<Button
					type="submit"
					color="secondary"
					variant="raised"
					disabled={!form.isValid || form.isValidating}
				>Log in</Button>
			)} />
		</LoginButtons>
	)

	public render() {
		const { login, password } = this.state;
		return (
			<Grid container flex-direction="row" justify="center">
				<Container item xs={9} sm={6} md={4} lg={3} xl={2}>
					<Panel title="Log in">
						<Headline>Welcome to 3D Repo!</Headline>

						<Formik
							initialValues={{ login, password }}
							onSubmit={this.handleSubmit}
							validationSchema={LoginSchema}
						>
							<form>
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
								{this.renderFooter()}
							</form>
						</Formik>
					</Panel>
				</Container>
			</Grid>
		);
	}
}
