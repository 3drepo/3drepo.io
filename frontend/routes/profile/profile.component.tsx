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
import { pick, omit, isEqual } from 'lodash';
import Dropzone from 'react-dropzone';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';

import { Panel } from '../components/panel/panel.component';
import { Headline, Form, StyledButton, StyledTextField, FieldsRow, StyledDropzone, DropzonePreview, DropzoneMessage, DropzoneContent, DropzoneProgress } from './profile.styles';

interface IProps {
	currentUser: any;
	onPasswordChange: (passwords) => void;
	onUserDataChange: (userData) => void;
	onAvatarChange: (file) => void;
	isAvatarPending: boolean;
}

interface IState {
	profileData: {
		firstName?: string;
		lastName?: string;
		email: string;
		avatarUrl: string;
	};
	passwordData: {
		oldPassword?: string;
		newPassword?: string;
	};
	uploadedAvatar: any;
}

export class Profile extends React.PureComponent<IProps, IState> {
	public state = {
		profileData: {
			firstName: '',
			lastName: '',
			email: '',
			avatarUrl: ''
		},
		passwordData: {
			oldPassword: '',
			newPassword: ''
		},
		uploadedAvatar: {}
	};

	public componentDidMount() {
		this.setState({
			profileData: pick(this.props.currentUser, [
				'firstName',
				'lastName',
				'email',
				'avatarUrl'
			])
		});
	}
	public componentDidUpdate(prevProps, prevState) {
		if (this.props.currentUser.avatarUrl !== prevProps.currentUser.avatarUrl) {
			this.setState({ uploadedAvatar: {}});
		}
	}

	public createProfileDataHandler = (field) => (event) => {
		this.setState({profileData: {
			...this.state.profileData,
			[field]: event.target.value
		}});
	}

	public createPasswordDataHandler = (field) => (event) => {
		this.setState({
			passwordData: {
				...this.state.passwordData,
				[field]: event.target.value
			}
		});
	}

	public handleProfileUpdate = () => {
		this.props.onUserDataChange(omit(this.state.profileData, 'avatarUrl'));
	}

	public handlePasswordUpdate = () => {
		this.props.onPasswordChange(this.state.passwordData);
	}

	public handleAvatarUpdate = (acceptedFiles) => {
		const uploadedAvatar = acceptedFiles[0] || {};
		this.setState({uploadedAvatar}, () => {
			this.props.onAvatarChange(uploadedAvatar);
		});
	}

	public isUserDataValid(newData, previousData) {
		return !isEqual(
			pick(previousData, ['firstName', 'lastName', 'email']),
			omit(newData, 'avatarUrl')
		) && newData.email;
	}

	public render() {
		const { currentUser, isAvatarPending } = this.props;
		const { profileData, passwordData, uploadedAvatar } = this.state as IState;

		const previewProps = { src: uploadedAvatar.preview || currentUser.avatarUrl } as any;

		const isValidPassword = passwordData.oldPassword &&
			passwordData.newPassword &&
			passwordData.oldPassword !== passwordData.newPassword;

		const isValidUserData = this.isUserDataValid(profileData, currentUser);

		return (
			<Panel title="Profile">
				<Form container direction="column">
					<Headline color="primary" variant="subheading">Basic information</Headline>
					<Grid container direction="row" wrap="nowrap">
						<StyledDropzone
							disabled={isAvatarPending}
							accept=".gif,.jpg,.png"
							onDrop={this.handleAvatarUpdate}
						>
							<DropzoneContent>
								{isAvatarPending ? <DropzoneProgress size={108} thickness={1} /> : null}
								{previewProps.src ? <DropzonePreview {...previewProps} /> : null }
								<DropzoneMessage>+</DropzoneMessage>
							</DropzoneContent>
						</StyledDropzone>
						<Grid container direction="column">
							<FieldsRow container wrap="nowrap">
								<StyledTextField
									value={profileData.firstName}
									label="First name"
									margin="normal"
									onChange={this.createProfileDataHandler('firstName')}
								/>
								<StyledTextField
									value={profileData.lastName}
									label="Last name"
									margin="normal"
									onChange={this.createProfileDataHandler('lastName')}
								/>
							</FieldsRow>
							<FieldsRow container wrap="nowrap">
								<StyledTextField
									value={currentUser.username}
									label="Username"
									margin="normal"
									disabled={true}
								/>
								<StyledTextField
									value={profileData.email}
									label="Email"
									margin="normal"
									required
									onChange={this.createProfileDataHandler('email')}
								/>
							</FieldsRow>
						</Grid>
					</Grid>
					<StyledButton
						onClick={this.handleProfileUpdate}
						color="secondary"
						variant="raised"
						disabled={!isValidUserData}
					>
						Update profile
					</StyledButton>
				</Form>
				<Form container direction="column">
					<Headline color="primary" variant="subheading">Password settings</Headline>
					<FieldsRow container wrap="nowrap">
						<StyledTextField
							label="Old password"
							margin="normal"
							required
							type="password"
							onChange={this.createPasswordDataHandler('oldPassword')}
						/>

						<StyledTextField
							label="New password"
							margin="normal"
							error={true}
							helperText="Must be at least 8 characters"
							required
							type="password"
							onChange={this.createPasswordDataHandler('newPassword')}
						/>
					</FieldsRow>

					<StyledButton
						onClick={this.handlePasswordUpdate}
						color="secondary"
						variant="raised"
						disabled={!isValidPassword}
					>
						Update password
					</StyledButton>
				</Form>
			</Panel>
		);
	}
}
