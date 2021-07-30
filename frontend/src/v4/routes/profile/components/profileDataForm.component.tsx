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
import { Field, Form, Formik } from 'formik';
import React from 'react';
import * as Yup from 'yup';

import { schema } from '../../../services/validation';

import {
	DropzoneContent,
	DropzoneMessage,
	DropzonePreview,
	DropzoneProgress,
	FieldsRow,
	FormContainer,
	Headline,
	StyledButton,
	StyledDropzone,
	StyledTextField
} from '../profile.styles';

interface IProps {
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	username: string;
	email: string;
	isAvatarPending: boolean;
	onAvatarChange: (file) => void;
	onUserDataChange: (userData) => void;
}

interface IState {
	uploadedAvatar: any;
}

const ProfileSchema = Yup.object().shape({
	firstName: schema.firstName,
	lastName: schema.lastName,
	email: schema.email
});

export class ProfileDataForm extends React.PureComponent<IProps, IState> {
	public state = {
		uploadedAvatar: {}
	};

	public handleAvatarUpdate = (acceptedFiles) => {
		const uploadedAvatar = acceptedFiles[0] || {};
		this.setState({ uploadedAvatar }, () => {
			this.props.onAvatarChange(uploadedAvatar);
		});
	}

	public handleProfileUpdate = (values, { resetForm }) => {
		this.props.onUserDataChange(values);
		resetForm();
	}

	public componentDidUpdate(prevProps) {
		if (this.props.avatarUrl !== prevProps.avatarUrl) {
			this.setState({ uploadedAvatar: {} });
		}
	}

	public render() {
		const { firstName, lastName, email, username, avatarUrl, isAvatarPending } = this.props;
		const { uploadedAvatar } = this.state as IState;
		const previewProps = { src: uploadedAvatar.preview || avatarUrl } as any;

		return (
			<Formik
				initialValues={{firstName, lastName, email}}
				validationSchema={ProfileSchema}
				onSubmit={this.handleProfileUpdate}
				enableReinitialize
			>
				<Form>
					<FormContainer container direction="column">
						<Headline color="primary" variant="subtitle1">Basic Information</Headline>
						<Grid container direction="row" wrap="nowrap">
							<StyledDropzone
								disabled={isAvatarPending}
								accept=".gif,.jpg,.png"
								onDrop={this.handleAvatarUpdate}
							>
								<DropzoneContent>
									{isAvatarPending ? <DropzoneProgress size={108} thickness={1} /> : null}
									{previewProps.src ? <DropzonePreview {...previewProps} /> : null}
									<DropzoneMessage>+</DropzoneMessage>
								</DropzoneContent>
							</StyledDropzone>
							<Grid container direction="column">
								<FieldsRow container wrap="nowrap">
									<Field name="firstName" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.firstName)}
											helperText={form.errors.firstName}
											required
											label="First name"
											margin="normal"
										/>
									)} />
									<Field name="lastName" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.lastName)}
											helperText={form.errors.lastName}
											required
											label="Last name"
											margin="normal"
										/>
									)} />
								</FieldsRow>
								<FieldsRow container wrap="nowrap">
									<StyledTextField
										value={username}
										label="Username"
										margin="normal"
										disabled
									/>
									<Field name="email" render={ ({ field, form }) => (
										<StyledTextField
											{...field}
											error={Boolean(form.errors.email)}
											helperText={form.errors.email}
											label="Email"
											margin="normal"
											required
										/>
									)} />
								</FieldsRow>
							</Grid>
						</Grid>
						<Field render={ ({ form }) => (
							<StyledButton
								color="secondary"
								variant="contained"
								disabled={!form.isValid || form.isValidating}
								type="submit"
							>
								Update profile
							</StyledButton>
						)} />
					</FormContainer>
				</Form>
			</Formik>
		);
	}
}
