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
	Form,
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
	onPasswordChange: (passwords) => void;
}

interface IState {
	oldPassword: string;
	newPassword: string;
	limitExceeded: boolean;
}

export class PasswordChangeForm extends React.PureComponent<IProps, IState> {
	public state = {
		oldPassword: '',
		newPassword: '',
		limitExceeded: false
	};

	public handlePasswordUpdate = () => {
		this.props.onPasswordChange(this.state);
	}

	public createDataHandler = (field) => (event) => {
		const changes = { value: event.target.value } as any;

		if (field === 'newPassword') {
			changes.limitExceeded = changes.value.length > 1 && changes.value.length < 8;
		}

		this.setState(changes);
	}

	public render() {
		const { oldPassword, newPassword, limitExceeded } = this.state;
		const isValidPassword = oldPassword && newPassword && oldPassword !== newPassword;

		return (
			<Form container direction="column">
				<Headline color="primary" variant="subheading">Password settings</Headline>
				<FieldsRow container wrap="nowrap">
					<StyledTextField
						label="Old password"
						margin="normal"
						required
						type="password"
						onChange={this.createDataHandler('oldPassword')}
					/>

					<StyledTextField
						label="New password"
						margin="normal"
						error={limitExceeded}
						helperText={limitExceeded ? 'Must be at least 8 characters' : null}
						required
						type="password"
						onChange={this.createDataHandler('newPassword')}
					/>
				</FieldsRow>

				<StyledButton
					onClick={this.handlePasswordUpdate}
					color="secondary"
					variant="raised"
					disabled={!isValidPassword}
					type="submit"
				>
					Update password
					</StyledButton>
			</Form>
		);
	}
}
