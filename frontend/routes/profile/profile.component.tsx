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
import { Headline, Form, StyledButton, StyledTextField, FieldsRow } from './profile.styles';
import { ProfileDataForm } from './components/profileDataForm.component';

interface IProps {
	currentUser: any;
	onPasswordChange: (passwords) => void;
	onUserDataChange: (userData) => void;
	onAvatarChange: (file) => void;
	isAvatarPending: boolean;
}

interface IState {
	passwordData: {
		oldPassword?: string;
		newPassword?: string;
	};
	uploadedAvatar: any;
}

export class Profile extends React.PureComponent<IProps, IState> {
	public state = {
		passwordData: {
			oldPassword: '',
			newPassword: ''
		},
		uploadedAvatar: {}
	};

	public createPasswordDataHandler = (field) => (event) => {
		this.setState({
			passwordData: {
				...this.state.passwordData,
				[field]: event.target.value
			}
		});
	}

	public handlePasswordUpdate = () => {
		this.props.onPasswordChange(this.state.passwordData);
	}

	public render() {
		const { currentUser, onUserDataChange, onAvatarChange, isAvatarPending } = this.props;
		const { passwordData } = this.state as IState;

		const isValidPassword = passwordData.oldPassword &&
			passwordData.newPassword &&
			passwordData.oldPassword !== passwordData.newPassword;

		const profileDataFormProps = {
			isAvatarPending,
			onUserDataChange,
			onAvatarChange,
			...pick(currentUser, ['firstName', 'lastName', 'email', 'avatarUrl', 'username'])
		} as any;

		return (
			<Panel title="Profile">
				{ currentUser.email ? <ProfileDataForm {...profileDataFormProps} /> : null }
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
