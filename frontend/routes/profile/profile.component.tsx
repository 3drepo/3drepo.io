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
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

import { Panel } from '../components/panel/panel.component';
import { Headline, Form, StyledButton } from './profile.styles';

interface IProps {
	currentUser: any;
	onPasswordChange: (password) => void;
	onUserDataChange: (userData) => void;
}

interface IState {
	profileData: {
		firstName?: string;
		lastName?: string;
		email: string;
	};
	passwordData: {
		current?: string;
		new?: string;
	};
}

export class Profile extends React.PureComponent<IProps, IState> {
	public state = {
		profileData: {
			firstName: '',
			lastName: '',
			email: ''
		},
		passwordData: {
			current: '',
			new: ''
		}
	};

	public handleProfileUpdate = () => {
		console.log('Update profile');
	}

	public handlePasswordUpdate = () => {
		console.log('Update profile');
	}

	public render() {
		const { currentUser } = this.props;
		const { profileData, passwordData } = this.state;
		return (
			<Panel title="Profile">
				<Form container direction="column">
					<Headline color="primary" variant="subheading">Basic info</Headline>
					<Grid container wrap="nowrap">
						<TextField
							value={profileData.firstName}
							label="First name"
							margin="normal"
						/>
						<TextField
							value={profileData.lastName}
							label="Last name"
							margin="normal"
						/>
					</Grid>
					<Grid container wrap="nowrap">
						<TextField
							value={currentUser.name}
							label="Username"
							margin="normal"
							inputProps={{
								readOnly: true
							}}
						/>
						<TextField
							value={profileData.email}
							label="Email"
							margin="normal"
							required
						/>
					</Grid>

					<StyledButton
						onClick={this.handleProfileUpdate}
						color="secondary"
						variant="raised"
						disabled={!profileData.email}
					>
						Update profile
					</StyledButton>
				</Form>
				<Form container direction="column">
					<Headline color="primary" variant="subheading">Password settings</Headline>
					<Grid container wrap="nowrap">
						<TextField
							label="Old password"
							margin="normal"
							required
							type="password"
						/>

						<TextField
							label="New password"
							margin="normal"
							helperText="Must be at least 8 characters"
							required
							type="password"
						/>
					</Grid>

					<StyledButton
						onClick={this.handlePasswordUpdate}
						color="secondary"
						variant="raised"
						disabled={!passwordData.current || !passwordData.new}
					>
						Update password
					</StyledButton>
				</Form>
			</Panel>
		);
	}
}
