/**
 *  Copyright (C) 2022 3D Repo Ltd
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
import { useState } from 'react';
import { formatMessage } from '@/v5/services/intl';
import { IUser } from '@/v5/store/users/users.redux';
import { FormattedMessage } from 'react-intl';
import { ErrorMessage } from '@controls/errorMessage/errorMessage.component';
import { fileIsTooBig } from '@/v5/store/currentUser/currentUser.helpers';
import {
	Header,
	ProfilePicture,
	Username,
	UserInfo,
	FullName,
	AddImageButton,
	AddImageInputLabel,
	AddImageHiddenInput,
	UserIcon,
} from './editProfileAvatar.styles';

type EditProfilePersonalTabProps = {
	newAvatarFile: File | null,
	setNewAvatarFile: (file: File | null) => void,
	user: IUser,
};

export const EditProfileAvatar = ({
	newAvatarFile,
	setNewAvatarFile,
	user,
}: EditProfilePersonalTabProps) => {
	const [avatarTooBigError, setAvatarTooBigError] = useState('');

	const addImage = (event) => {
		if (!event.target.files.length) return;
		const file = event.target.files[0];
		if (!fileIsTooBig(file)) {
			setAvatarTooBigError('');
			setNewAvatarFile(file);
		} else {
			setAvatarTooBigError(formatMessage({
				id: 'editProfile.avatar.error.size',
				defaultMessage: 'Image cannot exceed 1 MB.',
			}));
		}
	};

	const getAvatarUrl = () => (newAvatarFile ? URL.createObjectURL(newAvatarFile) : user.avatarUrl);
	const avatarIsAvailable = () => newAvatarFile || user.hasAvatar;

	return (
		<Header>
			<ProfilePicture>
				{avatarIsAvailable() ? (
					<img src={getAvatarUrl()} alt="avatar" />
				) : (
					<UserIcon />
				)}
			</ProfilePicture>
			<UserInfo>
				<Username>{user.username}</Username>
				<FullName>{user.firstName} {user.lastName}</FullName>
				<AddImageButton color={avatarIsAvailable() ? 'secondary' : 'primary'}>
					<AddImageInputLabel>
						{avatarIsAvailable() ? (
							<FormattedMessage id="editProfile.changeImage" defaultMessage="Change image" />
						) : (
							<FormattedMessage id="editProfile.addImage" defaultMessage="Add image" />
						)}
						<AddImageHiddenInput onChange={addImage} />
					</AddImageInputLabel>
				</AddImageButton>
				{(avatarTooBigError) && (
					<ErrorMessage>{avatarTooBigError}</ErrorMessage>
				)}
			</UserInfo>
		</Header>
	);
};
