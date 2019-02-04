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
import { pick } from 'lodash';

import { Panel } from '../components/panel/panel.component';
import { ProfileDataForm } from './components/profileDataForm.component';
import { PasswordChangeForm } from './components/passwordChangeForm.component';
import { Container } from './profile.styles';
import { APIKeyForm } from './components/apiKeyForm.component';

interface IProps {
	currentUser: any;
	onPasswordChange: (passwords) => void;
	onUserDataChange: (userData) => void;
	onAvatarChange: (file) => void;
	onGenerateApiKey: () => void;
	onDeleteApiKey: () => void;
	isAvatarPending: boolean;
}

export class Profile extends React.PureComponent<IProps, any> {
	public render() {
		const { currentUser, onUserDataChange, onAvatarChange,
				isAvatarPending, onPasswordChange, onGenerateApiKey, onDeleteApiKey} = this.props;

		const profileDataFormProps = {
			isAvatarPending,
			onUserDataChange,
			onAvatarChange,
			...pick(currentUser, ['firstName', 'lastName', 'email', 'avatarUrl', 'username'])
		} as any;

		const passwordChangeFormProps = { onPasswordChange } as any;

		const apiKeyProps = {
			onGenerateApiKey,
			onDeleteApiKey,
			...pick(currentUser, 'apiKey')
		};

		return (
			<Panel title="Profile">
				<Container>
					{currentUser.email ? <ProfileDataForm {...profileDataFormProps} /> : null}
					<PasswordChangeForm {...passwordChangeFormProps} />
					<APIKeyForm  {...apiKeyProps}/>
				</Container>
			</Panel>
		);
	}
}
