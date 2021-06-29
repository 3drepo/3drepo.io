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

import { Field, Form, Formik } from 'formik';
import { omit } from 'lodash';
import React from 'react';
import * as Yup from 'yup';

import {
	FieldsRow,
	FormContainer,
	Headline,
	StyledButton,
	StyledTextField
} from '../profile.styles';

import { getPasswordStrength, getPasswordStrengthMessage, schema } from '../../../services/validation';

const PasswordChangeSchema = Yup.object().shape({
	oldPassword: schema.password.min(0),
	newPassword: schema.password
		.differentThan(
			Yup.ref('oldPassword'),
			'New password should be different than old password'
		)
		.strength(1, 'This password is weak'),
	newPasswordConfirm: schema.password
		.min(0)
		.equalTo(
			Yup.ref('newPassword'),
			'Password confirmation must match new password'
		)
});

interface IProps {
	onPasswordChange: (passwords) => void;
}

interface IState {
	newPasswordStrengthMessage: string;
}

export class PasswordChangeForm extends React.PureComponent<IProps, IState> {
	public state = {
		newPasswordStrengthMessage: ''
	};

	public handlePasswordUpdate = (values, { resetForm }) => {
		this.props.onPasswordChange(omit(values, 'newPasswordConfirm'));
		resetForm();
		this.setState({
			newPasswordStrengthMessage: ''
		});
	}

	public handleNewPasswordChange = (onChange) => (event, ...params) => {
		const password = event.target.value;
		getPasswordStrength(password).then((strength) => {
			this.setState({
				newPasswordStrengthMessage: password.length > 7 ? ` (${getPasswordStrengthMessage(strength)})` : ''
			});
		});

		onChange(event, ...params);
	}

	public render() {
		return (
			<Formik
				initialValues={{oldPassword: '', newPassword: '', newPasswordConfirm: ''}}
				validationSchema={PasswordChangeSchema}
				onSubmit={this.handlePasswordUpdate}
			>
				<Form>
					<FormContainer container direction="column">
						<Headline color="primary" variant="subtitle1">Password Settings</Headline>
						<FieldsRow container wrap="nowrap">
							<Field name="oldPassword" render={ ({ field, form }) => (
								<StyledTextField
									{...field}
									error={Boolean(form.touched.oldPassword && form.errors.oldPassword)}
									helperText={form.touched.oldPassword && (form.errors.oldPassword || '')}
									label="Old password"
									margin="normal"
									required
									type="password"
									autoComplete="current-password"
								/>
							)} />

							<Field name="newPassword" render={ ({ field, form }) => (
								<StyledTextField
									{...field}
									error={Boolean(form.touched.newPassword && form.errors.newPassword)}
									helperText={form.touched.newPassword && (form.errors.newPassword || '')}
									label={`New password${this.state.newPasswordStrengthMessage}`}
									margin="normal"
									required
									type="password"
									autoComplete="new-password"
									onChange={this.handleNewPasswordChange(field.onChange)}
								/>
							)} />
							<Field name="newPasswordConfirm" render={ ({ field, form }) => (
								<StyledTextField
									{...field}
									error={Boolean(form.touched.newPasswordConfirm && form.errors.newPasswordConfirm)}
									helperText={form.touched.newPasswordConfirm && (form.errors.newPasswordConfirm || '')}
									label="New password confirmation"
									margin="normal"
									required
									type="password"
									autoComplete="new-password"
									onChange={this.handleNewPasswordChange(field.onChange)}
								/>
							)} />
						</FieldsRow>

						<Field render={ ({ form }) => (
							<StyledButton
								color="secondary"
								variant="contained"
								disabled={!form.isValid || form.isValidating}
								type="submit"
							>
								Update password
							</StyledButton>
						)} />
					</FormContainer>
				</Form>
			</Formik>
		);
	}
}
