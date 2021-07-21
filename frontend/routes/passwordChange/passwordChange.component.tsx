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
import TextField from '@material-ui/core/TextField';
import { Field, Form, Formik } from 'formik';
import * as queryString from 'query-string';
import React from 'react';
import { Link } from 'react-router-dom';
import * as Yup from 'yup';

import { getPasswordStrength, getPasswordStrengthMessage, schema } from '../../services/validation';
import { Panel } from '../components/panel/panel.component';
import { SubmitButton } from '../components/submitButton/submitButton.component';
import { Buttons, Container, Message, MessageButton, StyledButton } from './passwordChange.styles';

const PasswordChangeSchema = Yup.object().shape({
	newPassword: schema.password
		.strength(1, 'This password is weak'),
	newPasswordConfirm: schema.password
		.min(0)
		.equalTo(
			Yup.ref('newPassword'),
			'Password confirmation must match new password'
		)
});

interface IProps {
	location: any;
	isPending: boolean;
	message: string;
	changePassword: (username, token, password) => void;
	clearMessage: () => void;
}

interface IState {
	newPassword: string;
	newPasswordConfirm: string;
	newPasswordStrengthMessage: string;
	hasInvalidParams: boolean;
}

export class PasswordChange extends React.PureComponent<IProps, IState> {
	public state = {
		newPassword: '',
		newPasswordConfirm: '',
		newPasswordStrengthMessage: '',
		hasInvalidParams: false
	};

	public handleSubmit = (data) => {
		const {token, username} = queryString.parse(this.props.location.search);
		this.props.changePassword(username, token, data.newPassword);
	}

	public handleNewPasswordChange = (onChange) => (event, ...params) => {
		const password = event.target.value;
		getPasswordStrength (password).then((strength) => {
			this.setState({
				newPasswordStrengthMessage: password.length > 7 ? ` (${getPasswordStrengthMessage(strength)})` : ''
			});
		});

		onChange(event, ...params);
	}

	public componentDidMount() {
		const {token, username} = queryString.parse(this.props.location.search);
		this.setState({
			hasInvalidParams: !token || !username
		});
	}

	public componentWillUnmount() {
		this.props.clearMessage();
	}

	public renderBackToLogin = () => (
		<StyledButton
			color="secondary"
			component={Link}
			to="/login"
		>
			Back to Login
		</StyledButton>
	)

	public renderInvalidParams = () => (
		<>
			<Message>
				Cannot change password due to URL is incomplete.
				Please ensure you have copied the whole link and try again.
			</Message>
			<Buttons container justify="space-between">
				{this.renderBackToLogin()}
			</Buttons>
		</>
	)

	public renderResetPasswordForm = (newPassword, newPasswordConfirm) => (
		<>
			<Message>Please enter your new password</Message>
			<Formik
				initialValues={{ newPassword, newPasswordConfirm }}
				onSubmit={this.handleSubmit}
				validationSchema={PasswordChangeSchema}
			>
				<Form>
					<Field name="newPassword" render={({ field, form }) => (
						<TextField
							{...field}
							error={Boolean(form.touched.newPassword && form.errors.newPassword)}
							helperText={form.touched.newPassword && (form.errors.newPassword || '')}
							label={`New password${this.state.newPasswordStrengthMessage}`}
							margin="normal"
							required
							type="password"
							autoComplete="new-password"
							onChange={this.handleNewPasswordChange(field.onChange)}
							fullWidth
						/>
					)} />
					<Field name="newPasswordConfirm" render={({ field, form }) => (
						<TextField
							{...field}
							error={Boolean(form.touched.newPasswordConfirm && form.errors.newPasswordConfirm)}
							helperText={form.touched.newPasswordConfirm && (form.errors.newPasswordConfirm || '')}
							label="Confirm password"
							margin="normal"
							required
							type="password"
							autoComplete="new-password"
							fullWidth
						/>
					)} />
					<Buttons container justify="space-between">
						{this.renderBackToLogin()}
						<Field render={({ form }) => (
							<SubmitButton
								pending={this.props.isPending}
								disabled={!form.isValid || form.isValidating}
							>
								Set password
							</SubmitButton>
						)} />
					</Buttons>
				</Form>
			</Formik>
		</>
	)

	public render() {
		const { newPassword, newPasswordConfirm, hasInvalidParams } = this.state;

		return (
			<Container
				container
				direction="column"
				alignItems="center">
				<Grid item xs={9} sm={7} md={5} lg={3} xl={2}>
					<Panel title="Reset password">
						{ this.props.message
							? <>
								<Message>{this.props.message}</Message>
								<MessageButton
									color="secondary"
									component={Link}
									to="/login"
								>
									Back to Login
								</MessageButton>
							</>
							:
							<>
								{hasInvalidParams && this.renderInvalidParams()}
								{!hasInvalidParams && this.renderResetPasswordForm(newPassword, newPasswordConfirm)}
							</>
						}
					</Panel>
				</Grid>
			</Container>
		);
	}
}
