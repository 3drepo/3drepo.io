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
import { isEqual, pick, omit } from 'lodash';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Grid from '@material-ui/core/Grid';

import {
	FormContainer,
	Headline,
	StyledDropzone,
	DropzoneMessage,
	DropzoneProgress,
	StyledTextField,
	FieldsRow,
	DropzoneContent,
	DropzonePreview,
	StyledButton
} from '../profile.styles';

import { getPasswordStrength, getPasswordStrengthMessage, schema } from '../../../services/passwordValidation';
import { memoize } from 'lodash';

const PasswordChangeSchema = Yup.object().shape({
	oldPassword: schema.password.min(0),
	newPassword: schema.password
		.differentThan(
			Yup.ref('oldPassword'),
			'New password should be different than old password'
		)
		.strength(1, 'This password is weak')
});

interface IProps {
	onPasswordChange: (passwords) => void;
}

interface IState {
	oldPassword: string;
	newPassword: string;
	newPasswordStrengthMessage: string;
}

export class PasswordChangeForm extends React.PureComponent<IProps, IState> {
	public state = {
		oldPassword: '',
		newPassword: '',
		newPasswordStrengthMessage: ''
	};

	public handlePasswordUpdate = () => {
		this.props.onPasswordChange(this.state);
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
				initialValues={{oldPassword: '', newPassword: ''}}
				validationSchema={PasswordChangeSchema}
				onSubmit={this.handlePasswordUpdate}
			>
				<Form>
					<FormContainer container direction="column">
						<Headline color="primary" variant="subheading">Password settings</Headline>
						<FieldsRow container wrap="nowrap">
							<Field name="oldPassword" render={({ field, form }) => (
								<StyledTextField
									{...field}
									error={Boolean(form.touched.oldPassword && form.errors.oldPassword)}
									helperText={form.touched.oldPassword && (form.errors.oldPassword || '')}
									label="Old password"
									margin="normal"
									required
									type="password"
								/>
							)} />

							<Field name="newPassword" render={({ field, form }) => (
								<StyledTextField
									{...field}
									error={Boolean(form.touched.newPassword && form.errors.newPassword)}
									helperText={form.touched.newPassword && (form.errors.newPassword || '')}
									label={`New password${this.state.newPasswordStrengthMessage}`}
									margin="normal"
									required
									type="password"
									onChange={this.handleNewPasswordChange(field.onChange)}
								/>
							)} />
						</FieldsRow>

						<Field render={({ form }) => (
							<StyledButton
								color="secondary"
								variant="raised"
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
