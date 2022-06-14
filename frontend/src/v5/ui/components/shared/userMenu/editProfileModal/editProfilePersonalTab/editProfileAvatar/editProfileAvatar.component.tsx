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
import { ICurrentUser } from '@/v5/store/currentUser/currentUser.types';
import { FormattedMessage } from 'react-intl';
import { useFormContext } from 'react-hook-form';
import {
	Header,
	ProfilePicture,
	Username,
	UserInfo,
	FullName,
	AvatarInput,
	UserIcon,
	TruncatableName,
	Avatar,
} from './editProfileAvatar.styles';

type EditProfilePersonalTabProps = {
	user: ICurrentUser,
};

export const EditProfileAvatar = ({ user }: EditProfilePersonalTabProps) => {
	const { getValues, control, formState: { errors: formErrors } } = useFormContext();

	const newAvatar = getValues('avatarFile');

	const addImage = (event, { onChange: setAvatarFile }) => {
		if (!event.target.files.length) return;
		const file = event.target.files[0];
		setAvatarFile(file);
	};

	const getUserWithAvatar = () => {
		if (!newAvatar) return user;
		return {
			...user,
			hasAvatar: true,
			avatarUrl: URL.createObjectURL(newAvatar),
		};
	};

	const avatarIsAvailable = () => newAvatar || user.hasAvatar;

	return (
		<Header>
			<ProfilePicture>
				{avatarIsAvailable() ? (
					<Avatar user={getUserWithAvatar()} />
				) : (
					<UserIcon />
				)}
			</ProfilePicture>
			<UserInfo>
				<Username>{user.username}</Username>
				<FullName>
					<TruncatableName>{user.firstName}</TruncatableName>
					<TruncatableName>{user.lastName}</TruncatableName>
				</FullName>
				<AvatarInput
					name="avatarFile"
					control={control}
					formError={formErrors.avatarFile}
					label={avatarIsAvailable() ? (
						<FormattedMessage id="editProfile.changeImage" defaultMessage="Change image" />
					) : (
						<FormattedMessage id="editProfile.addImage" defaultMessage="Add image" />
					)}
					onChange={addImage}
					buttonProps={{
						color: avatarIsAvailable() ? 'secondary' : 'primary',
						variant: 'outlined',
					}}
				/>
			</UserInfo>
		</Header>
	);
};
