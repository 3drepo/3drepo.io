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

interface IProps {
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	username: string;
	email: string;
	isAvatarPending: boolean;
	onAvatarChange: (file) => void;
	onUserDataChange: (userData) => void;
	validationErrors: any;
}

interface IState {
	firstName?: string;
	lastName?: string;
	avatarUrl?: string;
	username: string;
	email: string;
	uploadedAvatar: any;
}

const EDITABLE_FIELDS = ['firstName', 'lastName', 'email'];

export class ProfileDataForm extends React.PureComponent<IProps, IState> {
	public state = {
		firstName: '',
		lastName: '',
		avatarUrl: '',
		username: '',
		email: '',
		uploadedAvatar: {}
	};

	public handleAvatarUpdate = (acceptedFiles) => {
		const uploadedAvatar = acceptedFiles[0] || {};
		this.setState({ uploadedAvatar }, () => {
			this.props.onAvatarChange(uploadedAvatar);
		});
	}

	public handleProfileUpdate = () => {
		this.props.onUserDataChange(pick(this.state, EDITABLE_FIELDS));
	}

	public isUserDataValid(newData, previousData) {
		return !isEqual(pick(newData, EDITABLE_FIELDS), pick(previousData, EDITABLE_FIELDS)) && newData.email;
	}

	public createDataHandler = (field) => (event) => {
		this.setState({ [field]: event.target.value });
	}

	public componentDidMount() {
		const userData = pick(this.props, [...EDITABLE_FIELDS, 'avatarUrl']) as IState;
		this.setState(userData);
	}

	public componentDidUpdate(prevProps, prevState) {
		if (this.props.avatarUrl !== prevProps.avatarUrl) {
			this.setState({ uploadedAvatar: {} });
		}
	}

	public render() {
		const { username, avatarUrl, isAvatarPending } = this.props;
		const { firstName, lastName, email, uploadedAvatar } = this.state as IState;
		const previewProps = { src: uploadedAvatar.preview || avatarUrl } as any;

		const isValidUserData = this.isUserDataValid(this.state, this.props);

		return (
			<FormContainer container direction="column">
				<Headline color="primary" variant="subheading">Basic information</Headline>
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
							<StyledTextField
								value={firstName}
								required
								label="First name"
								margin="normal"
								onChange={this.createDataHandler('firstName')}
							/>
							<StyledTextField
								required
								value={lastName}
								label="Last name"
								margin="normal"
								onChange={this.createDataHandler('lastName')}
							/>
						</FieldsRow>
						<FieldsRow container wrap="nowrap">
							<StyledTextField
								value={username}
								label="Username"
								margin="normal"
								disabled={true}
							/>
							<StyledTextField
								value={email}
								label="Email"
								margin="normal"
								required
								onChange={this.createDataHandler('email')}
							/>
						</FieldsRow>
					</Grid>
				</Grid>
				<StyledButton
					onClick={this.handleProfileUpdate}
					color="secondary"
					variant="raised"
					disabled={!isValidUserData}
					type="submit"
				>
					Update profile
				</StyledButton>
			</FormContainer>
		);
	}
}
